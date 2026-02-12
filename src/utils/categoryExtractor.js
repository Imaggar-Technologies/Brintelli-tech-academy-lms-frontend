/**
 * Extract category/tag from program name or description
 * @param {string} programName - Program name
 * @param {string} description - Optional description
 * @returns {string} Category tag
 */
export const extractCategory = (programName = '', description = '') => {
  const text = `${programName} ${description}`.toLowerCase();
  
  // Category mappings
  const categories = {
    'python': ['python', 'py'],
    'cyber security': ['cyber', 'cybersecurity', 'security', 'penetration', 'ethical hacking', 'hacking'],
    'ai/ml': ['ai', 'ml', 'machine learning', 'artificial intelligence', 'deep learning', 'neural'],
    'dsa': ['dsa', 'data structures', 'algorithms', 'algorithm'],
    'web development': ['web', 'full stack', 'fullstack', 'frontend', 'backend', 'react', 'node', 'javascript', 'js'],
    'java': ['java'],
    'cloud': ['cloud', 'aws', 'azure', 'gcp', 'devops'],
    'data science': ['data science', 'data analytics', 'analytics'],
    'mobile': ['mobile', 'android', 'ios', 'react native', 'flutter'],
    'blockchain': ['blockchain', 'crypto', 'ethereum', 'bitcoin'],
  };
  
  // Find matching category
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }
  
  // Default to first word of program name or "General"
  const firstWord = programName.split(' ')[0];
  return firstWord || 'General';
};

/**
 * Get category color for badge
 * @param {string} category - Category name
 * @returns {string} Tailwind color classes
 */
export const getCategoryColor = (category) => {
  const colors = {
    'python': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'cyber security': 'bg-red-100 text-red-700 border-red-200',
    'ai/ml': 'bg-purple-100 text-purple-700 border-purple-200',
    'dsa': 'bg-blue-100 text-blue-700 border-blue-200',
    'web development': 'bg-green-100 text-green-700 border-green-200',
    'java': 'bg-orange-100 text-orange-700 border-orange-200',
    'cloud': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'data science': 'bg-pink-100 text-pink-700 border-pink-200',
    'mobile': 'bg-teal-100 text-teal-700 border-teal-200',
    'blockchain': 'bg-gray-100 text-gray-700 border-gray-200',
  };
  
  return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
};
























