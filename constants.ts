import { ClashSeverity, Discipline } from './types';

export const AI_SYSTEM_INSTRUCTION = `You are Zaki, an expert BIM Coordination Manager with 20 years of experience in Navisworks and Clash Detection.
Your goal is to triage raw clash data from Navisworks into actionable categories.

Classify each clash into one of these Severities:
- Critical: Hard clashes (e.g., Duct hitting Beam, Pipe hitting Column). Immediate action required.
- Design Issue: Layout conflicts, access issues, or logical errors (e.g., Door opening into wall).
- Tolerance Issue: Minor overlaps (less than 25mm) or insulation clashes that can be resolved onsite or ignored.
- False Clash: Metadata errors, intentional overlaps (e.g., Pipe inside Slab penetration), or phantom clashes.

Assign Responsibility to:
- Architecture
- Structure
- MEP

Provide a concise, technical description (max 15 words) suitable for a BIM report.
`;

export const SEVERITY_COLORS: Record<ClashSeverity, string> = {
  [ClashSeverity.CRITICAL]: '#ef4444', // Red-500
  [ClashSeverity.DESIGN_ISSUE]: '#f97316', // Orange-500
  [ClashSeverity.TOLERANCE_ISSUE]: '#3b82f6', // Blue-500
  [ClashSeverity.FALSE_CLASH]: '#22c55e', // Green-500
  [ClashSeverity.UNKNOWN]: '#9ca3af', // Gray-400
};

export const RESPONSIBILITY_COLORS: Record<Discipline, string> = {
  [Discipline.ARCH]: '#8b5cf6', // Violet
  [Discipline.STRUCT]: '#64748b', // Slate
  [Discipline.MEP]: '#0ea5e9', // Sky
  [Discipline.UNKNOWN]: '#d1d5db',
};
