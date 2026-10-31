import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import evaluacionesRoutes from './routes/evaluaciones.js';
import adminRoutes from './routes/admin.js';
import notasRoutes from './routes/notas.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/evaluaciones', evaluacionesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notas', notasRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
