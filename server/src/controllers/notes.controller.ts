import { Response } from 'express';
import Note from '../models/Note';
import { AuthRequest } from '../middleware/auth';
import { SubscriptionPlan } from '../models/Tenant';

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

export const getNotes = async (req: AuthRequest, res: Response) => {
  try {
    const tenant = req.tenant!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const notes = await Note.find({ tenantId: tenant._id })
      .populate('authorId', 'email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Note.countDocuments({ tenantId: tenant._id });

    res.status(200).json({
      success: true,
      data: notes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

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