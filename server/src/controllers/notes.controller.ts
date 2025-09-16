import { Response } from 'express';
import Note from '../models/Note';
import { AuthRequest } from '../middleware/auth';
import { SubscriptionPlan } from '../models/Tenant';

/**
 * Creates a new note for the authenticated user within their tenant
 * 
 * @param req - Express request object with authenticated user and tenant
 * @param res - Express response object
 * 
 * @returns JSON response with created note data or error message
 * 
 * @example
 * POST /api/notes
 * Body: { "title": "My Note", "content": "Note content here" }
 * 
 * Success Response (201):
 * {
 *   "success": true,
 *   "message": "Note created successfully",
 *   "data": { note object with populated author }
 * }
 * 
 * Error Responses:
 * - 400: Missing title or content
 * - 403: Note limit reached for free plan
 * - 500: Internal server error
 */
export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;
    const user = req.user!;
    const tenant = req.tenant!;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Check subscription limits
    if (tenant.plan === SubscriptionPlan.FREE) {
      const noteCount = await Note.countDocuments({ tenantId: tenant._id });
      if (noteCount >= tenant.maxNotes) {
        return res.status(403).json({
          success: false,
          message: 'Note limit reached. Upgrade to Pro for unlimited notes.',
          code: 'NOTE_LIMIT_REACHED'
        });
      }
    }

    const note = await Note.create({
      title,
      content,
      authorId: user._id,
      tenantId: tenant._id
    });

    await note.populate('authorId', 'email');

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
/**
 * Retrieves paginated list of notes for the authenticated user's tenant
 * 
 * @param req - Express request object with query parameters for pagination
 * @param res - Express response object
 * 
 * @query page - Page number (default: 1)
 * @query limit - Number of notes per page (default: 10)
 * 
 * @returns JSON response with paginated notes and pagination metadata
 * 
 * @example
 * GET /api/notes?page=1&limit=10
 * 
 * Success Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "notes": [array of note objects],
 *     "pagination": {
 *       "currentPage": 1,
 *       "totalPages": 3,
 *       "totalNotes": 25,
 *       "hasMore": true
 *     }
 *   }
 * }
 */
export const getNotes = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({
      success: false,
        message: "User not authenticated",
    });
  }

    const tenant = req.tenant!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 6;
    const skip = (page - 1) * limit;

    const notes = await Note.find({ tenantId: tenant._id })
      .populate('authorId', 'email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const totalNotes = await Note.countDocuments({ tenantId: tenant._id });

    res.status(200).json({
      success: true,
      data: {
        notes,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalNotes / limit),
          totalNotes,
          hasMore: skip + notes.length < totalNotes,
        },
      },
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notes',
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
/**
 * Retrieves a specific note by ID within the authenticated user's tenant
 * 
 * @param req - Express request object with note ID parameter
 * @param res - Express response object
 * 
 * @param id - Note ID from URL parameters
 * 
 * @returns JSON response with note data or error message
 * 
 * @example
 * GET /api/notes/507f1f77bcf86cd799439011
 * 
 * Success Response (200):
 * {
 *   "success": true,
 *   "data": { note object with populated author }
 * }
 * 
 * Error Responses:
 * - 404: Note not found
 * - 500: Internal server error
 */
export const getNoteById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tenant = req.tenant!;

    const note = await Note.findOne({ 
      _id: id, 
      tenantId: tenant._id 
    }).populate('authorId', 'email');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Get note by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Updates an existing note owned by the authenticated user
 * 
 * @param req - Express request object with note ID and update data
 * @param res - Express response object
 * 
 * @param id - Note ID from URL parameters
 * @body title - Updated note title
 * @body content - Updated note content
 * 
 * @returns JSON response with updated note data or error message
 * 
 * @example
 * PUT /api/notes/507f1f77bcf86cd799439011
 * Body: { "title": "Updated Title", "content": "Updated content" }
 * 
 * Success Response (200):
 * {
 *   "success": true,
 *   "message": "Note updated successfully",
 *   "data": { updated note object }
 * }
 * 
 * Error Responses:
 * - 400: Missing title or content
 * - 404: Note not found or no permission
 * - 500: Internal server error
 */
export const updateNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const tenant = req.tenant!;
    const user = req.user!;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const note = await Note.findOneAndUpdate(
      { 
        _id: id, 
        tenantId: tenant._id,
        authorId: user._id // Users can only update their own notes
      },
      { title, content },
      { new: true, runValidators: true }
    ).populate('authorId', 'email');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or you do not have permission to update it'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: note
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Deletes a note owned by the authenticated user
 * 
 * @param req - Express request object with note ID parameter
 * @param res - Express response object
 * 
 * @param id - Note ID from URL parameters
 * 
 * @returns JSON response with success message or error
 * 
 * @example
 * DELETE /api/notes/507f1f77bcf86cd799439011
 * 
 * Success Response (200):
 * {
 *   "success": true,
 *   "message": "Note deleted successfully"
 * }
 * 
 * Error Responses:
 * - 404: Note not found or no permission
 * - 500: Internal server error
 */
export const deleteNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tenant = req.tenant!;
    const user = req.user!;

    const note = await Note.findOneAndDelete({
      _id: id,
      tenantId: tenant._id,
      authorId: user._id // Users can only delete their own notes
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or you do not have permission to delete it'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};