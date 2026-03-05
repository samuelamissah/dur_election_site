
export type Candidate = {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl?: string;
};

export type Position = {
  id: string;
  title: string;
  description: string;
  candidates: Candidate[];
};

export const POSITIONS: Position[] = [
  {
    id: 'chairman',
    title: 'Chairman',
    description: 'Responsible for leading the committee and overseeing all operations.',
    candidates: [
      {
        id: 'c1',
        name: 'Alexander Hamilton',
        role: 'Senior Manager',
        bio: 'Over 10 years of experience in strategic leadership and organizational growth.',
        imageUrl: 'https://placehold.co/400x400/png?text=AH',
      },
      {
        id: 'c2',
        name: 'Elizabeth Schuyler',
        role: 'Director of Operations',
        bio: 'Proven track record of optimizing processes and fostering team collaboration.',
        imageUrl: 'https://placehold.co/400x400/png?text=ES',
      },
    ],
  },
  {
    id: 'vice-chairman',
    title: 'Vice Chairman',
    description: 'Supports the Chairman and steps in when necessary.',
    candidates: [
      {
        id: 'c3',
        name: 'Aaron Burr',
        role: 'Legal Counsel',
        bio: 'Expert in corporate law and governance with a focus on ethical leadership.',
        imageUrl: 'https://placehold.co/400x400/png?text=AB',
      },
      {
        id: 'c4',
        name: 'Thomas Jefferson',
        role: 'Head of Strategy',
        bio: 'Innovative thinker with a passion for long-term planning and development.',
        imageUrl: 'https://placehold.co/400x400/png?text=TJ',
      },
    ],
  },
  {
    id: 'treasurer',
    title: 'Treasurer',
    description: 'Manages the financial assets and records of the organization.',
    candidates: [
      {
        id: 'c5',
        name: 'George Washington',
        role: 'Chief Financial Officer',
        bio: 'Financial expert with a reputation for integrity and fiscal responsibility.',
        imageUrl: 'https://placehold.co/400x400/png?text=GW',
      },
      {
        id: 'c6',
        name: 'John Adams',
        role: 'Finance Manager',
        bio: 'Detail-oriented professional with extensive experience in budgeting and auditing.',
        imageUrl: 'https://placehold.co/400x400/png?text=JA',
      },
    ],
  },
  {
    id: 'secretary',
    title: 'Secretary',
    description: 'Maintains records, minutes, and correspondence.',
    candidates: [
      {
        id: 'c7',
        name: 'James Madison',
        role: 'Communications Director',
        bio: 'Skilled communicator with a talent for clear and concise documentation.',
        imageUrl: 'https://placehold.co/400x400/png?text=JM',
      },
      {
        id: 'c8',
        name: 'Dolley Madison',
        role: 'Administrative Lead',
        bio: 'Highly organized and efficient, ensuring smooth administrative operations.',
        imageUrl: 'https://placehold.co/400x400/png?text=DM',
      },
    ],
  },
  {
    id: 'welfare',
    title: 'Welfare Officer',
    description: 'Ensures the well-being and morale of the staff.',
    candidates: [
      {
        id: 'c9',
        name: 'Marquis de Lafayette',
        role: 'HR Manager',
        bio: 'Dedicated to creating a positive and inclusive work environment for all.',
        imageUrl: 'https://placehold.co/400x400/png?text=ML',
      },
      {
        id: 'c10',
        name: 'Hercules Mulligan',
        role: 'Staff Representative',
        bio: 'Passionate advocate for staff rights and welfare initiatives.',
        imageUrl: 'https://placehold.co/400x400/png?text=HM',
      },
    ],
  },
];
