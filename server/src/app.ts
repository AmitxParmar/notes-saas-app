import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Routes
import healthRoutes from './routes/health.route';
import notesRoutes from './routes/notes.route';
import authRoutes from './routes/auth.route';
import tenantRoutes from './routes/tenant.route';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { limiter } from './utils/rateLimiter';

dotenv.config();

const app: Express = express();

// Security middleware
app.use(helmet());

app.use(limiter);

// CORS configuration
const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];

        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Base URL endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is well and running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// Routes
app.use('/health', healthRoutes);
app.use('/api/v1/notes', notesRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tenant', tenantRoutes);

console.log('✅ Routes registered:');
console.log('   - /health');
console.log('   - /api/v1/notes');
console.log('   - /api/v1/auth');
console.log('   - /api/v1/tenant');

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware
app.use(errorHandler);

export default app;