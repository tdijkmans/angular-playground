import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TddStep {
  step: string;
  description: string;
  color: string;
}

interface CodeExample {
  title: string;
  description: string;
  code: string;
  result?: string;
}

interface Scenario {
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  example: CodeExample;
}

@Component({
  selector: 'app-tdd-explanation',
  imports: [CommonModule],
  templateUrl: './tdd-explanation.html',
  styleUrl: './tdd-explanation.scss'
})
export class TddExplanation {
  currentStep = signal(0);
  selectedScenario = signal(0);

  tddSteps: TddStep[] = [
    {
      step: 'Red',
      description: 'Write a failing test first. This defines what you want your code to do.',
      color: '#e74c3c'
    },
    {
      step: 'Green',
      description: 'Write the minimum code needed to make the test pass.',
      color: '#27ae60'
    },
    {
      step: 'Refactor',
      description: 'Improve the code while keeping tests green. Clean up and optimize.',
      color: '#3498db'
    }
  ];

  scenarios: Scenario[] = [
    {
      title: 'TDD Works Great: Simple Calculator',
      description: 'TDD shines when requirements are clear and logic is well-defined.',
      pros: [
        'Clear requirements and expected outcomes',
        'Pure functions with predictable inputs/outputs',
        'Easy to test in isolation',
        'Immediate feedback on correctness'
      ],
      cons: [
        'May feel slower initially',
        'Requires discipline to write tests first'
      ],
      example: {
        title: 'Calculator Add Function',
        description: 'A perfect TDD candidate - clear input, clear output',
        code: `// Test First (Red)
test('add should return sum of two numbers', () => {
  expect(add(2, 3)).toBe(5);
  expect(add(-1, 1)).toBe(0);
});

// Implementation (Green)
function add(a: number, b: number): number {
  return a + b;
}

// Refactor - already clean!`,
        result: 'Tests pass ✅ Code is reliable and well-tested'
      }
    },
    {
      title: 'TDD is Challenging: Complex UI Interactions',
      description: 'TDD becomes difficult when dealing with complex user interactions and visual components.',
      pros: [
        'Still provides some safety net',
        'Forces thinking about component API'
      ],
      cons: [
        'Hard to write tests for visual behavior',
        'User interactions are complex to simulate',
        'Tests may become brittle and hard to maintain',
        'Mocking complex dependencies is time-consuming'
      ],
      example: {
        title: 'Drag & Drop Component',
        description: 'Testing visual interactions requires complex setup',
        code: `// Complex test setup needed
test('drag and drop should reorder items', () => {
  // Need to mock mouse events, DOM manipulation
  const mockMouseDown = jest.fn();
  const mockMouseMove = jest.fn();
  const mockMouseUp = jest.fn();
  
  // Simulate complex user interaction...
  // This gets complicated fast!
});

// Component has many visual concerns
class DragDropList {
  // Visual positioning, animations, 
  // browser differences, etc.
}`,
        result: 'Tests are complex and may break when UI changes'
      }
    },
    {
      title: 'Development First Works Better: Prototyping & Discovery',
      description: 'When exploring ideas or learning new technologies, development-first can be more productive.',
      pros: [
        'Faster exploration and experimentation',
        'Better for learning new APIs or frameworks',
        'Allows creative problem-solving',
        'Good for proof-of-concepts'
      ],
      cons: [
        'May accumulate technical debt',
        'Less reliable code initially',
        'Harder to refactor safely later'
      ],
      example: {
        title: 'Exploring a New Animation Library',
        description: 'When learning, it\'s often better to experiment first',
        code: `// Start by experimenting
function tryDifferentAnimations() {
  // Try bounce effect
  element.animate({
    transform: ['scale(1)', 'scale(1.2)', 'scale(1)']
  }, { duration: 300, easing: 'ease-out' });
  
  // Try fade effect
  element.animate({
    opacity: [1, 0.5, 1]
  }, { duration: 500 });
  
  // Discover what works through experimentation
}

// THEN write tests once you know what you want`,
        result: 'Rapid discovery → Add tests later for reliability'
      }
    }
  ];

  nextStep(): void {
    this.currentStep.update(step => (step + 1) % this.tddSteps.length);
  }

  selectScenario(index: number): void {
    this.selectedScenario.set(index);
  }
}
