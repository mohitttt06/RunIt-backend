import { Router, Request, Response } from 'express';
import { executeCode, TestCase } from '../services/judge0Service.ts';

const router = Router();

router.post('/run-code', async (req: Request, res: Response) => {
  const { code, language, testCases } = req.body;

  if (!code || !language || !testCases || !Array.isArray(testCases)) {
    return res.status(400).json({ error: 'Missing required fields: code, language, or testCases array' });
  }

  try {
    const results = await executeCode(code, language, testCases as TestCase[]);
    res.json({ results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
