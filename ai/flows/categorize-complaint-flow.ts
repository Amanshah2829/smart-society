
'use server';
/**
 * @fileOverview An AI flow to categorize resident complaints.
 *
 * - categorizeComplaint - A function that suggests a category and priority for a complaint.
 * - CategorizeComplaintInput - The input type for the categorizeComplaint function.
 * - CategorizeComplaintOutput - The return type for the categorizeComplaint function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const CategorizeComplaintInputSchema = z.object({
  title: z.string().describe('The title of the complaint.'),
  description: z.string().describe('The detailed description of the complaint.'),
});
export type CategorizeComplaintInput = z.infer<typeof CategorizeComplaintInputSchema>;

export const CategorizeComplaintOutputSchema = z.object({
  category: z.enum(['plumbing', 'electrical', 'cleaning', 'security', 'maintenance', 'other']).describe('The suggested category for the complaint.'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).describe('The suggested priority for the complaint.'),
});
export type CategorizeComplaintOutput = z.infer<typeof CategorizeComplaintOutputSchema>;


const categorizeComplaintPrompt = ai.definePrompt({
  name: 'categorizeComplaintPrompt',
  input: { schema: CategorizeComplaintInputSchema },
  output: { schema: CategorizeComplaintOutputSchema },
  prompt: `
    You are an expert at managing a residential society. Based on the complaint title and description, please determine the most appropriate category and priority level.

    Analyze the user's complaint:
    Title: {{{title}}}
    Description: {{{description}}}

    **Categories to choose from:**
    - plumbing: Issues related to water, pipes, taps, leakage, etc.
    - electrical: Issues with lights, fans, power outlets, wiring, etc.
    - cleaning: Issues related to cleanliness of common areas, garbage disposal, etc.
    - security: Issues related to safety, unauthorized access, parking disputes, etc.
    - maintenance: General repairs, elevator issues, common area upkeep, etc.
    - other: For any other issues.

    **Priority levels to choose from:**
    - low: Minor inconvenience, can be addressed when time permits.
    - medium: Causes some inconvenience but is not critical.
    - high: Significant issue affecting daily life, needs prompt attention.
    - urgent: Critical issue that poses a safety risk or major disruption, requires immediate action.

    Please provide your output in the specified JSON format.
  `,
});


const categorizeComplaintFlow = ai.defineFlow(
  {
    name: 'categorizeComplaintFlow',
    inputSchema: CategorizeComplaintInputSchema,
    outputSchema: CategorizeComplaintOutputSchema,
  },
  async (input) => {
    const { output } = await categorizeComplaintPrompt(input);
    if (!output) {
      throw new Error("Failed to get a response from the AI model.");
    }
    return output;
  }
);


export async function categorizeComplaint(input: CategorizeComplaintInput): Promise<CategorizeComplaintOutput> {
  return categorizeComplaintFlow(input);
}
