export const givingUrl = 'https://www.hncoc.org/give/?fund=4'
export const defaults = {
  heroTitle: 'Building for Our Future',
  heroDescription:
    'Help us complete important improvements to our church home through sponsoring a window or supporting one of our construction projects.',
  logo: '/img/holy-nativity-logo.jpeg',
  heroImage: '/img/holy-nativity-church.jpg',
  windowAmount: 600,
  projects: [
    {
      id: 'windows',
      name: 'Window Replacements',
      goal: 22000,
      description:
        'Bring new light into our church home with 36 beautiful replacement windows.',
      image: '/img/project-windows.jpg',
    },
    {
      id: 'stucco',
      name: 'Stucco',
      goal: 15000,
      description:
        'Restore and protect the exterior of our church for generations to come.',
      image: '/img/project-stucco.jpg',
    },
    {
      id: 'roofing',
      name: 'Roofing',
      goal: 17000,
      description:
        'Care for the roof that shelters our worship and fellowship.',
      image: '/img/project-roofing.jpg',
    },
    {
      id: 'painting',
      name: 'Framing & Painting',
      goal: 10000,
      description:
        'Renew our gathering spaces with thoughtful repairs and fresh paint.',
      image: '/img/project-painting.jpg',
    },
    {
      id: 'ac',
      name: 'Air Conditioning',
      goal: 5000,
      description: 'Create a comfortable, welcoming space for every season.',
      image: '/img/project-ac.jpg',
    },
    {
      id: 'electrical',
      name: 'Electrical',
      goal: 5000,
      description:
        'Improve electrical systems to serve our growing parish safely.',
      image: '/img/project-electrical.jpg',
    },
  ],
}
export type Campaign = typeof defaults
export type PublicData = {
  content: Campaign
  totals: Record<string, { pledged: number; confirmed: number }>
  windows: { number: number; status: string }[]
}
export const money = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
