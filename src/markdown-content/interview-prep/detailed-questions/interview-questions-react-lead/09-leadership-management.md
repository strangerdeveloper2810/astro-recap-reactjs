# 09 - Leadership & Team Management

> **10 câu hỏi chuyên sâu về Leadership và quản lý team cho React Lead**

---

## Q9.1: Effective Code Review Process

### Câu hỏi
Làm thế nào để setup và conduct effective code reviews cho team?

### Trả lời

#### Code Review Framework

```
┌─────────────────────────────────────────────────────────────┐
│               CODE REVIEW FRAMEWORK                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   GOALS:                                                     │
│   ├── Knowledge sharing                                      │
│   ├── Bug prevention                                        │
│   ├── Code quality maintenance                              │
│   ├── Mentoring opportunities                               │
│   └── Team alignment on standards                           │
│                                                              │
│   REVIEW CHECKLIST:                                         │
│   ┌─────────────────────────────────────────┐               │
│   │ 1. FUNCTIONALITY                        │               │
│   │    □ Does it solve the problem?         │               │
│   │    □ Edge cases handled?                │               │
│   │    □ Error handling present?            │               │
│   ├─────────────────────────────────────────┤               │
│   │ 2. CODE QUALITY                         │               │
│   │    □ Readable and maintainable?         │               │
│   │    □ Follows team conventions?          │               │
│   │    □ No code duplication?               │               │
│   ├─────────────────────────────────────────┤               │
│   │ 3. PERFORMANCE                          │               │
│   │    □ Efficient algorithms?              │               │
│   │    □ No unnecessary renders?            │               │
│   │    □ Memory leaks avoided?              │               │
│   ├─────────────────────────────────────────┤               │
│   │ 4. SECURITY                             │               │
│   │    □ Input validated?                   │               │
│   │    □ No exposed secrets?                │               │
│   │    □ Safe data handling?                │               │
│   ├─────────────────────────────────────────┤               │
│   │ 5. TESTING                              │               │
│   │    □ Tests included?                    │               │
│   │    □ Edge cases covered?                │               │
│   │    □ Tests meaningful?                  │               │
│   └─────────────────────────────────────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Pull Request Template

```markdown
<!-- .github/pull_request_template.md -->
## Summary
<!-- Brief description of changes -->

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Refactoring (no functional changes)
- [ ] Documentation update

## Related Issues
<!-- Link to related issues: Fixes #123, Relates to #456 -->

## Changes Made
<!-- Bullet points of key changes -->
-
-

## Screenshots (if applicable)
<!-- Before/After screenshots for UI changes -->

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented hard-to-understand areas
- [ ] My changes generate no new warnings
- [ ] I have updated documentation if needed

## Additional Notes
<!-- Any context reviewers should know -->
```

#### Review Guidelines for Reviewers

```markdown
# Code Review Guidelines

## DO
- Review within 24 hours (ideally same day)
- Be constructive and kind
- Explain the "why" behind suggestions
- Praise good code, not just critique
- Ask questions instead of making demands
- Focus on the code, not the person
- Suggest alternatives, not just problems

## DON'T
- Be condescending or dismissive
- Block PRs for style preferences
- Nitpick on subjective matters
- Leave vague comments
- Review when frustrated or rushed

## Comment Examples

### ❌ Bad
"This is wrong."
"Why did you do it this way?"
"This doesn't make sense."

### ✅ Good
"Consider using useCallback here to prevent unnecessary re-renders.
See: [link to docs]"

"I'm not sure I understand the purpose of this variable.
Could you add a comment explaining its role?"

"Nice solution! One suggestion: we could simplify this
by using Array.reduce() instead of the manual loop."

## Approval Criteria
- All tests passing
- No unresolved conversations
- At least one approval from code owner
- No critical security issues
```

---

## Q9.2: Technical Decision Making Framework

### Câu hỏi
Bạn approach technical decisions như thế nào khi có nhiều options?

### Trả lời

#### Decision Framework

```
┌─────────────────────────────────────────────────────────────┐
│            TECHNICAL DECISION FRAMEWORK                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   1. DEFINE THE PROBLEM                                     │
│   ├── What exactly are we solving?                          │
│   ├── What are the constraints?                             │
│   ├── What are the success criteria?                        │
│   └── What's the timeline?                                  │
│                                                              │
│   2. GATHER OPTIONS                                          │
│   ├── Research available solutions                          │
│   ├── Consider build vs buy                                 │
│   ├── Look at what others have done                         │
│   └── Include "do nothing" as an option                     │
│                                                              │
│   3. EVALUATE OPTIONS                                        │
│   ├── Technical fit                                         │
│   ├── Team expertise                                        │
│   ├── Maintenance burden                                    │
│   ├── Cost (time, money, opportunity)                       │
│   ├── Risk assessment                                       │
│   └── Scalability                                           │
│                                                              │
│   4. MAKE DECISION                                          │
│   ├── Document reasoning                                    │
│   ├── Get stakeholder buy-in                                │
│   ├── Define success metrics                                │
│   └── Plan rollback strategy                                │
│                                                              │
│   5. EXECUTE & LEARN                                        │
│   ├── Implement in phases if possible                       │
│   ├── Monitor metrics                                       │
│   ├── Gather feedback                                       │
│   └── Retrospect and document learnings                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Architecture Decision Record (ADR)

```markdown
# ADR-001: State Management Solution

## Status
Accepted

## Date
2024-01-15

## Context
Our React application needs a state management solution. Currently using
prop drilling which is becoming unmaintainable as the app grows.

Requirements:
- Support for 50+ developers
- TypeScript support
- Good DevTools
- Active community
- Performance at scale

## Options Considered

### Option 1: Redux Toolkit
**Pros:**
- Industry standard, well-known
- Excellent DevTools
- Strong TypeScript support
- Large ecosystem

**Cons:**
- More boilerplate
- Steeper learning curve
- May be overkill for simple apps

### Option 2: Zustand
**Pros:**
- Minimal boilerplate
- Easy to learn
- Good TypeScript support
- Small bundle size

**Cons:**
- Smaller ecosystem
- Less established patterns
- Fewer learning resources

### Option 3: React Context + useReducer
**Pros:**
- No external dependencies
- Built into React
- Simple for small apps

**Cons:**
- Performance issues at scale
- No DevTools
- Manual optimization needed

## Decision
We will use **Redux Toolkit** because:
1. Team already has Redux experience
2. Best DevTools for debugging
3. Established patterns for large teams
4. RTK Query for server state

## Consequences
- All new features use Redux Toolkit
- Existing Context-based state migrated gradually
- Team training session scheduled
- Migration completed by Q2

## Related
- [Migration Plan](./migration-plan.md)
- [Redux Guidelines](./redux-guidelines.md)
```

---

## Q9.3: Mentoring Junior Developers

### Câu hỏi
Làm thế nào để mentoring junior developers hiệu quả?

### Trả lời

#### Mentoring Framework

```
┌─────────────────────────────────────────────────────────────┐
│               MENTORING FRAMEWORK                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ONBOARDING (First 2 weeks)                                │
│   ├── Pair on small tasks                                   │
│   ├── Explain codebase architecture                         │
│   ├── Review development workflow                           │
│   ├── Introduce team conventions                            │
│   └── Set up 1:1 schedule                                   │
│                                                              │
│   GROWTH PHASE (Months 1-3)                                 │
│   ├── Assign progressively complex tasks                    │
│   ├── Detailed code reviews with explanations               │
│   ├── Encourage questions                                   │
│   ├── Share learning resources                              │
│   └── Weekly 1:1s for progress check                        │
│                                                              │
│   INDEPENDENCE (Months 3-6)                                 │
│   ├── Reduce hand-holding                                   │
│   ├── Review approach before implementation                 │
│   ├── Let them make mistakes (safely)                       │
│   ├── Delegate ownership of features                        │
│   └── Biweekly 1:1s                                         │
│                                                              │
│   ADVANCEMENT (6+ months)                                   │
│   ├── Include in architecture discussions                   │
│   ├── Have them review others' code                         │
│   ├── Encourage them to mentor newer members                │
│   ├── Support career goals                                  │
│   └── Monthly 1:1s                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Effective Feedback Techniques

```markdown
# Feedback Framework: SBI (Situation-Behavior-Impact)

## For Positive Feedback
**Situation:** "In yesterday's code review..."
**Behavior:** "...you took time to explain the reasoning behind
your suggestions and provided documentation links."
**Impact:** "This helped the junior developer understand not just
what to change, but why, accelerating their learning."

## For Constructive Feedback
**Situation:** "During the sprint planning meeting..."
**Behavior:** "...I noticed you committed to implementing the
feature without asking clarifying questions about the requirements."
**Impact:** "This led to a misunderstanding that required rework.
Let's discuss how we can improve requirement gathering."

## For Development Areas
**Situation:** "Looking at your recent PRs..."
**Behavior:** "...I see the tests often focus on happy paths
without edge case coverage."
**Impact:** "This has led to some bugs in production. I'd like
to pair with you on test planning for your next feature."
```

#### Growth Path Definition

```typescript
// Career ladder example
interface SkillMatrix {
  technical: {
    react: 'learning' | 'competent' | 'proficient' | 'expert';
    typescript: 'learning' | 'competent' | 'proficient' | 'expert';
    testing: 'learning' | 'competent' | 'proficient' | 'expert';
    architecture: 'learning' | 'competent' | 'proficient' | 'expert';
  };
  soft: {
    communication: 'developing' | 'effective' | 'strong' | 'exceptional';
    collaboration: 'developing' | 'effective' | 'strong' | 'exceptional';
    problemSolving: 'developing' | 'effective' | 'strong' | 'exceptional';
    leadership: 'developing' | 'effective' | 'strong' | 'exceptional';
  };
}

const juniorExpectations: SkillMatrix = {
  technical: {
    react: 'competent',
    typescript: 'learning',
    testing: 'learning',
    architecture: 'learning'
  },
  soft: {
    communication: 'developing',
    collaboration: 'developing',
    problemSolving: 'developing',
    leadership: 'developing'
  }
};

const seniorExpectations: SkillMatrix = {
  technical: {
    react: 'proficient',
    typescript: 'proficient',
    testing: 'proficient',
    architecture: 'competent'
  },
  soft: {
    communication: 'effective',
    collaboration: 'strong',
    problemSolving: 'strong',
    leadership: 'effective'
  }
};
```

---

## Q9.4: Managing Technical Debt

### Câu hỏi
Làm thế nào để identify, prioritize, và address technical debt?

### Trả lời

#### Technical Debt Categories

```
┌─────────────────────────────────────────────────────────────┐
│                 TECHNICAL DEBT MATRIX                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    HIGH IMPACT                               │
│                        ▲                                     │
│            ┌──────────┼──────────┐                          │
│            │    DO    │   DO     │                          │
│   LOW      │   SOON   │  FIRST   │   HIGH                   │
│   EFFORT   │          │          │   EFFORT                 │
│            ├──────────┼──────────┤                          │
│            │  DO IF   │ SCHEDULE │                          │
│            │   TIME   │  LATER   │                          │
│            └──────────┴──────────┘                          │
│                        ▼                                     │
│                    LOW IMPACT                                │
│                                                              │
│   CATEGORIES:                                                │
│   ├── Code Debt: Duplicated code, complex functions         │
│   ├── Design Debt: Poor architecture, tight coupling        │
│   ├── Test Debt: Missing tests, flaky tests                 │
│   ├── Documentation Debt: Outdated docs                     │
│   └── Dependency Debt: Outdated packages                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Tech Debt Tracking System

```typescript
// Technical debt item structure
interface TechDebtItem {
  id: string;
  title: string;
  description: string;
  category: 'code' | 'design' | 'test' | 'documentation' | 'dependency';
  severity: 'critical' | 'high' | 'medium' | 'low';
  effort: 'small' | 'medium' | 'large' | 'xlarge';
  impact: string;
  affectedAreas: string[];
  createdDate: Date;
  reporter: string;
  status: 'identified' | 'prioritized' | 'in-progress' | 'resolved';
  resolvedDate?: Date;
}

// Tech debt backlog management
const techDebtBacklog: TechDebtItem[] = [
  {
    id: 'TD-001',
    title: 'Migrate from class components to functional',
    description: '45 class components still exist in /legacy folder',
    category: 'code',
    severity: 'medium',
    effort: 'large',
    impact: 'Blocks adoption of new hooks patterns, harder to maintain',
    affectedAreas: ['src/legacy/*', 'src/components/old/*'],
    createdDate: new Date('2024-01-01'),
    reporter: 'tech-lead',
    status: 'prioritized'
  },
  {
    id: 'TD-002',
    title: 'Add TypeScript strict mode',
    description: 'Enable strict mode and fix all type errors',
    category: 'code',
    severity: 'high',
    effort: 'medium',
    impact: 'Type safety issues causing production bugs',
    affectedAreas: ['src/**/*.ts', 'src/**/*.tsx'],
    createdDate: new Date('2024-01-15'),
    reporter: 'senior-dev',
    status: 'identified'
  }
];
```

#### Tech Debt Sprint Allocation

```markdown
# Tech Debt Policy

## Sprint Allocation
- 20% of each sprint allocated to tech debt
- This is non-negotiable unless critical deadline

## Prioritization Criteria (Weekly)
1. Security vulnerabilities → Immediate
2. Performance blockers → High priority
3. Developer productivity impacts → Medium priority
4. Code quality improvements → Regular backlog

## Boy Scout Rule
"Leave the codebase cleaner than you found it"
- When touching a file, improve it if reasonable
- Small refactors included in feature work
- Document debt found during work

## Tech Debt Reviews
- Monthly: Review tech debt backlog
- Quarterly: Major tech debt initiatives
- Annually: Architecture review
```

---

## Q9.5: Conducting Effective 1:1s

### Câu hỏi
Làm thế nào để conduct effective 1:1 meetings với team members?

### Trả lời

```markdown
# 1:1 Meeting Framework

## Meeting Structure (30-45 min)
1. **Check-in** (5 min) - How are they doing? Personal wins?
2. **Their agenda** (15 min) - Let them drive the conversation
3. **My topics** (10 min) - Feedback, updates, alignment
4. **Growth discussion** (5 min) - Career, skills, goals
5. **Action items** (5 min) - Clear next steps

## Questions Bank

### For Understanding State
- "What's on your mind this week?"
- "What's been the most challenging part of your work recently?"
- "Is there anything blocking you that I can help with?"
- "How are you feeling about our current project?"

### For Growth & Development
- "What skills would you like to develop?"
- "Is there any project you'd like to be involved in?"
- "What type of work energizes you the most?"
- "Where do you see yourself in 1-2 years?"

### For Feedback
- "What could I do differently to better support you?"
- "Is there anything about how the team operates that frustrates you?"
- "Do you feel like you're getting enough feedback?"
- "What do you think we should start/stop/continue doing?"

### For Remote Teams
- "How are you managing work-life balance?"
- "Do you have everything you need to work effectively from home?"
- "Are you feeling connected to the team?"

## Notes Template

```
## 1:1 Notes - [Name] - [Date]

### Their Updates
-

### My Updates
-

### Discussed Topics
-

### Action Items
- [ ] [Action] - [Owner] - [Due Date]

### Follow-up for Next Time
-
```

## Anti-Patterns to Avoid
- ❌ Using 1:1s only for status updates (use standups)
- ❌ Canceling 1:1s frequently
- ❌ Dominating the conversation
- ❌ Not following up on action items
- ❌ Ignoring personal/emotional topics
```

---

## Q9.6: Building Team Culture

### Câu hỏi
Làm thế nào để build và maintain một positive engineering culture?

### Trả lời

```
┌─────────────────────────────────────────────────────────────┐
│               ENGINEERING CULTURE PILLARS                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   1. PSYCHOLOGICAL SAFETY                                    │
│   ├── Safe to ask questions                                 │
│   ├── Safe to make mistakes                                 │
│   ├── Safe to disagree                                      │
│   └── Safe to take risks                                    │
│                                                              │
│   2. CONTINUOUS LEARNING                                     │
│   ├── Tech talks and knowledge sharing                      │
│   ├── Conference budget                                     │
│   ├── Time for learning new things                          │
│   └── Documentation culture                                 │
│                                                              │
│   3. OWNERSHIP & AUTONOMY                                   │
│   ├── Clear ownership of features/systems                   │
│   ├── Trust to make decisions                               │
│   ├── Freedom to choose solutions                           │
│   └── Accountability for outcomes                           │
│                                                              │
│   4. COLLABORATION                                           │
│   ├── Pair programming sessions                             │
│   ├── Cross-team knowledge sharing                          │
│   ├── Open communication channels                           │
│   └── Celebration of team wins                              │
│                                                              │
│   5. QUALITY FOCUS                                           │
│   ├── Code review standards                                 │
│   ├── Testing expectations                                  │
│   ├── Performance monitoring                                │
│   └── Technical excellence celebrated                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Culture Building Activities

```markdown
# Team Building Activities

## Regular Activities

### Weekly
- **Tech Talk Friday** (30 min)
  - Rotating presenter
  - Topics: new tech, learnings, interesting bugs
  - No pressure, casual atmosphere

### Monthly
- **Hackathon Day** (1 day)
  - Work on anything interesting
  - Present at end of day
  - Best ideas get allocated sprint time

- **Retrospective** (1 hour)
  - What went well
  - What could improve
  - Action items with owners

### Quarterly
- **Architecture Review** (half day)
  - Review current architecture
  - Discuss pain points
  - Plan improvements

- **Team Outing** (half day)
  - Non-work activity
  - Team bonding

## Recognition Programs

### Kudos System
- Public channel for giving kudos
- Weekly recognition in team meeting
- Tied to company values

### Spotlight Awards
- Monthly recognition
- Categories: Innovation, Collaboration, Quality
- Small prize + public recognition

## Communication Norms

### Async-First
- Default to written communication
- Meetings only when necessary
- Document decisions

### Blameless Culture
- Focus on systems, not individuals
- Post-incident reviews without blame
- Share learnings openly
```

---

## Q9.7: Conflict Resolution

### Câu hỏi
Làm thế nào để handle conflicts trong team?

### Trả lời

```
┌─────────────────────────────────────────────────────────────┐
│              CONFLICT RESOLUTION FRAMEWORK                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   STEP 1: IDENTIFY                                          │
│   ├── What is the actual conflict?                          │
│   ├── Who is involved?                                      │
│   ├── What triggered it?                                    │
│   └── Is it technical or interpersonal?                     │
│                                                              │
│   STEP 2: UNDERSTAND                                        │
│   ├── Listen to all sides                                   │
│   ├── Ask clarifying questions                              │
│   ├── Understand underlying needs                           │
│   └── Identify common ground                                │
│                                                              │
│   STEP 3: MEDIATE                                           │
│   ├── Facilitate discussion                                 │
│   ├── Keep focus on issues, not people                      │
│   ├── Encourage empathy                                     │
│   └── Find win-win solutions                                │
│                                                              │
│   STEP 4: RESOLVE                                           │
│   ├── Agree on solution                                     │
│   ├── Document if needed                                    │
│   ├── Set clear expectations                                │
│   └── Follow up                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Common Conflict Scenarios

```markdown
# Technical Disagreement

## Scenario
Two senior developers disagree on architecture approach.

## Resolution Approach
1. **Set up a design review meeting**
   - Both present their approaches
   - Focus on pros/cons, not personalities

2. **Establish evaluation criteria**
   - Performance requirements
   - Maintenance burden
   - Team expertise
   - Timeline constraints

3. **Data-driven decision**
   - Prototype if time allows
   - Reference similar decisions in industry
   - Consider long-term implications

4. **Make a decision and document**
   - Use ADR format
   - Explain reasoning
   - Allow for future reassessment

---

# Interpersonal Conflict

## Scenario
Team member feels excluded from important discussions.

## Resolution Approach
1. **Private conversation with affected person**
   - Listen without defending
   - Understand their perspective
   - Acknowledge their feelings

2. **Investigate the pattern**
   - Are they actually being excluded?
   - Is it intentional or oversight?
   - What's causing this?

3. **Address root cause**
   - Review meeting invites
   - Clarify communication norms
   - Establish inclusive practices

4. **Follow up**
   - Check in after 2 weeks
   - Observe improvements
   - Adjust if needed

---

# Performance Conflict

## Scenario
High performer frustrated with underperforming teammate.

## Resolution Approach
1. **Acknowledge the frustration**
   - Thank them for caring about quality
   - Listen to specific concerns

2. **Separate responsibilities**
   - Address underperformance separately
   - Don't involve the high performer in that process

3. **Set expectations**
   - Explain how you're handling it
   - Ask for patience
   - Request they continue to be supportive

4. **Address the performance issue**
   - Direct feedback to underperformer
   - Create improvement plan
   - Monitor progress
```

---

## Q9.8: Stakeholder Management

### Câu hỏi
Làm thế nào để communicate effectively với non-technical stakeholders?

### Trả lời

```markdown
# Stakeholder Communication Framework

## Know Your Audience

### Executives
- **Care about:** Business impact, ROI, timelines
- **Communication style:** High-level, outcomes-focused
- **Frequency:** Monthly updates, ad-hoc for issues

### Product Managers
- **Care about:** Features, user impact, dependencies
- **Communication style:** Detailed but not technical
- **Frequency:** Weekly syncs, daily for blockers

### Other Teams
- **Care about:** Integration points, timelines, dependencies
- **Communication style:** Technical but accessible
- **Frequency:** As needed, documented in shared spaces

## Communication Templates

### Project Status Update (Executive)
```
## Project: [Name]
**Status:** 🟢 On Track | 🟡 At Risk | 🔴 Blocked

### Progress This Month
- Delivered: [Feature X, Feature Y]
- Impact: [Metric improvement]

### Next Month
- Planned: [Feature Z]
- Dependencies: [Team A needs to deliver by...]

### Risks
- [Risk]: [Mitigation plan]

### Need from Leadership
- [Decision needed by date]
```

### Technical Decision (Non-Technical)
```
## Decision Needed: [Topic]

### The Situation
[Business context in simple terms]

### Options
1. **Option A:** [Name]
   - Pros: [Business benefit]
   - Cons: [Business risk]
   - Timeline: X weeks

2. **Option B:** [Name]
   - Pros: [Business benefit]
   - Cons: [Business risk]
   - Timeline: Y weeks

### Recommendation
[Option X] because [business reason]

### What This Means
- For users: [Impact]
- For timeline: [Impact]
- For budget: [Impact]
```

## Difficult Conversations

### Delivering Bad News
1. **Be direct** - Don't bury the lead
2. **Take ownership** - Don't blame others
3. **Bring solutions** - Not just problems
4. **Set expectations** - What happens next

### Example
❌ "We had some issues with the third-party API that caused
   some delays, and there were some unexpected complexities..."

✅ "We won't hit the March deadline. Here's why and our plan:
   - Root cause: [Specific reason]
   - New timeline: April 15
   - What we're doing: [Specific actions]
   - How we'll prevent this: [Future measures]"
```

---

## Q9.9: Hiring và Interview Process

### Câu hỏi
Làm thế nào để design effective interview process cho React developers?

### Trả lời

```
┌─────────────────────────────────────────────────────────────┐
│               INTERVIEW PROCESS DESIGN                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   STAGE 1: RESUME SCREEN (15 min)                           │
│   ├── Relevant experience                                   │
│   ├── Technical skills match                                │
│   └── Red flags check                                       │
│                                                              │
│   STAGE 2: PHONE SCREEN (30 min)                            │
│   ├── Basic technical questions                             │
│   ├── Experience discussion                                 │
│   ├── Motivation and expectations                           │
│   └── Answer candidate questions                            │
│                                                              │
│   STAGE 3: TECHNICAL ROUND (60 min)                         │
│   ├── Live coding exercise                                  │
│   ├── Problem solving approach                              │
│   ├── Code quality discussion                               │
│   └── Technical depth probing                               │
│                                                              │
│   STAGE 4: SYSTEM DESIGN (45 min)                           │
│   ├── Design a React application                            │
│   ├── Architecture decisions                                │
│   ├── Trade-offs discussion                                 │
│   └── Scalability considerations                            │
│                                                              │
│   STAGE 5: CULTURE FIT (30 min)                             │
│   ├── Team collaboration style                              │
│   ├── Conflict resolution examples                          │
│   ├── Learning and growth mindset                           │
│   └── Values alignment                                      │
│                                                              │
│   STAGE 6: TEAM MEET (30 min)                               │
│   ├── Informal chat with team                               │
│   ├── Candidate asks questions                              │
│   └── Two-way evaluation                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Interview Questions Bank

```markdown
# Technical Questions by Level

## Junior (0-2 years)
- Explain the difference between state and props
- How does useEffect work? What's the dependency array?
- Build a simple todo list component
- What happens when you call setState?
- How would you fetch data in a component?

## Mid-Level (2-5 years)
- Explain React's reconciliation process
- When would you use useCallback vs useMemo?
- How do you handle form state in a complex form?
- Design a reusable modal component
- How would you optimize a slow component?

## Senior (5+ years)
- Explain React Fiber architecture
- How would you design a state management solution?
- Walk through debugging a performance issue
- Design a component library architecture
- How do you handle micro-frontend communication?

## Lead Level (7+ years)
- How would you migrate a large codebase from class to hooks?
- Design a testing strategy for a React application
- How do you balance tech debt with feature development?
- Describe how you've mentored team members
- How do you make architectural decisions?

# Behavioral Questions

## Problem Solving
- Tell me about a difficult bug you solved
- Describe a time you had to learn something new quickly

## Collaboration
- Tell me about a disagreement with a colleague
- How do you give and receive feedback?

## Leadership (for leads)
- How have you grown team members?
- Describe a difficult technical decision you made
- How do you handle underperformers?

# Evaluation Criteria

## Technical (1-5 scale)
- Problem solving approach
- Code quality
- Technical knowledge depth
- System design ability

## Non-Technical (1-5 scale)
- Communication clarity
- Collaboration indicators
- Learning mindset
- Culture fit
```

---

## Q9.10: Project Planning và Estimation

### Câu hỏi
Làm thế nào để estimate và plan frontend projects effectively?

### Trả lời

```
┌─────────────────────────────────────────────────────────────┐
│              ESTIMATION FRAMEWORK                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ESTIMATION TECHNIQUES                                      │
│                                                              │
│   1. T-SHIRT SIZING                                         │
│   ├── XS: < 4 hours                                         │
│   ├── S: 4-8 hours (1 day)                                  │
│   ├── M: 1-3 days                                           │
│   ├── L: 3-5 days                                           │
│   └── XL: > 5 days (needs breakdown)                        │
│                                                              │
│   2. STORY POINTS (Fibonacci)                               │
│   ├── 1: Trivial, well-understood                           │
│   ├── 2: Simple, minor complexity                           │
│   ├── 3: Moderate complexity                                │
│   ├── 5: Complex, some unknowns                             │
│   ├── 8: Very complex, significant unknowns                 │
│   └── 13+: Needs breakdown                                  │
│                                                              │
│   MULTIPLIERS                                                │
│   ├── New technology: 1.5x                                  │
│   ├── Integration work: 1.3x                                │
│   ├── Legacy code: 1.5x                                     │
│   └── First time doing: 2x                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Project Planning Template

```markdown
# Project Plan: [Project Name]

## Overview
**Goal:** [What we're building and why]
**Success Metrics:** [How we measure success]
**Timeline:** [Start date] - [End date]

## Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Project setup and configuration
- [ ] Core component architecture
- [ ] API integration setup
- [ ] Testing infrastructure

**Deliverable:** Basic app running with core structure

### Phase 2: Core Features (Week 3-5)
- [ ] Feature A: User authentication
- [ ] Feature B: Dashboard
- [ ] Feature C: Data management

**Deliverable:** Core functionality working

### Phase 3: Polish (Week 6)
- [ ] Performance optimization
- [ ] Error handling
- [ ] Edge cases
- [ ] Accessibility

**Deliverable:** Production-ready application

### Phase 4: Launch (Week 7)
- [ ] Final testing
- [ ] Documentation
- [ ] Deployment
- [ ] Monitoring setup

**Deliverable:** Live in production

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| API delays | Medium | High | Mock API early |
| Scope creep | High | Medium | Strict change process |
| Resource availability | Low | High | Cross-train team |

## Team & Responsibilities

| Role | Person | Responsibilities |
|------|--------|------------------|
| Tech Lead | [Name] | Architecture, code review |
| Senior Dev | [Name] | Core features, mentoring |
| Dev | [Name] | Feature implementation |
| QA | [Name] | Testing, quality |

## Communication Plan
- Daily standup: 9:30 AM
- Weekly stakeholder update: Friday 3 PM
- Slack channel: #project-name
- Documentation: Confluence/Notion
```

#### Handling Estimation Challenges

```markdown
# Common Estimation Pitfalls & Solutions

## "How long will this take?"

### Wrong Answer
"About 2 weeks"

### Better Answer
"Based on similar work, I estimate 8-12 days.
Here's the breakdown:
- Component development: 3-4 days
- API integration: 2-3 days
- Testing: 2-3 days
- Buffer for unknowns: 1-2 days

The main risks are [X] and [Y] which could add time."

## Dealing with Pressure to Reduce Estimates

1. **Explain the breakdown**
   Show where time goes

2. **Identify trade-offs**
   "We can do X faster if we skip Y"

3. **Highlight risks**
   "Rushing will likely cause [consequence]"

4. **Offer alternatives**
   "We could deliver MVP by [date], full version by [date]"

## When Estimates Are Wrong

1. **Communicate early**
   Don't wait until deadline

2. **Explain what changed**
   Be specific about the cause

3. **Provide new estimate**
   With reasoning

4. **Learn for next time**
   Update estimation process
```

---

## Tổng kết Leadership Skills

| Skill | Key Practices |
|-------|---------------|
| Code Review | Timely, constructive, educational |
| Technical Decisions | Framework-based, documented, reversible |
| Mentoring | Structured growth, regular feedback |
| Tech Debt | Tracked, prioritized, allocated time |
| 1:1s | Regular, employee-driven, action-oriented |
| Culture | Psychological safety, learning, ownership |
| Conflict | Address early, focus on issues, find win-win |
| Stakeholders | Know audience, communicate impact |
| Hiring | Structured process, diverse evaluation |
| Planning | Transparent estimates, risk-aware |

**Key Takeaways:**
1. Lead by example - model the behavior you expect
2. Invest in people development
3. Make decisions transparently
4. Create psychological safety
5. Communicate consistently and clearly
