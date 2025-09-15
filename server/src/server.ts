import { app } from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();