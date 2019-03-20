import { Router } from 'express';
import { ensureAuth } from '../utils/socialAuth';

const routes = Router();

routes.get('/', async (req, res, next) => {
  const { query } = req.body;
  if (!query) {
    return next('Specify a query.');
  }

  // await RepoQueue.findOneAndUpdate({ fullName }, { fullName }, { new: true, upsert: true });

  res.json({
    fullName,
    message: 'Added to queue!'
  });
});

export default routes;
