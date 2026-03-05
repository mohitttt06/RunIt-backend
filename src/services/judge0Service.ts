import axios from 'axios';

const languageMap: Record<string, number> = {
  'cpp': 54,        // C++ (GCC 9.2.0)
  'python': 71,     // Python (3.8.1)
  'java': 62,       // Java (OpenJDK 13.0.1)
  'javascript': 63, // JavaScript (Node.js 12.14.0)
  'c': 50,          // C (GCC 9.2.0)
  'typescript': 74, // TypeScript (3.7.4)
  'go': 60,         // Go (1.13.5)
  'rust': 73,       // Rust (1.40.0)
  'kotlin': 78,     // Kotlin (1.3.70)
  'csharp': 51      // C# (Mono 6.6.0.161)
};

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface ExecutionResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  memory: number | null;
  status: {
    id: number;
    description: string;
  } | null;
}

export const executeCode = async (code: string, language: string, testCases: TestCase[]): Promise<ExecutionResult[]> => {
  const languageId = languageMap[language.toLowerCase()];
  
  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const results: ExecutionResult[] = [];

  for (const testCase of testCases) {
    try {
      // 1. Submit to Judge0
      const submissionResponse = await axios.post(
        'https://ce.judge0.com/submissions?base64_encoded=false&wait=true',
        {
          source_code: code,
          language_id: languageId,
          stdin: testCase.input,
          expected_output: testCase.expectedOutput
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 seconds timeout
        }
      );

      const data = submissionResponse.data;

      results.push({
        input: testCase.input,
        expected: testCase.expectedOutput,
        actual: data.stdout ? data.stdout.trim() : '',
        passed: data.status?.id === 3, // 3 is "Accepted"
        stderr: data.stderr,
        compile_output: data.compile_output,
        time: data.time,
        memory: data.memory,
        status: data.status
      });
    } catch (error: any) {
      console.error('Judge0 API Error:', error.response?.data || error.message);
      results.push({
        input: testCase.input,
        expected: testCase.expectedOutput,
        actual: 'Error connecting to Judge0',
        passed: false,
        stderr: error.message,
        compile_output: null,
        time: null,
        memory: null,
        status: { id: 0, description: 'Internal Error' }
      });
    }
  }

  return results;
};
