
import { genkit, ai } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { defineGcpProject, onGcpProject } from '@genkit-ai/google-cloud';

// This is a placeholder for your Google Cloud Project ID.
// For example: 'my-gcp-project-id'
const a = '';

defineGcpProject(
  {
    projectId: a || 'your-gcp-project-id',
  },
  async () => {
    genkit({
      plugins: [
        onGcpProject(a, () =>
          googleAI({
            location: 'us-central1',
          })
        ),
      ],
      flowStateStore: 'gcp',
      traceStore: 'gcp',
      logLevel: 'debug',
    });
  }
);

export { ai };
