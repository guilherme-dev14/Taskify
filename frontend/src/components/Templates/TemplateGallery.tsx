import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  StarIcon,
  ClockIcon,
  UserGroupIcon,
  TagIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  HeartIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  tags: string[];
  usageCount: number;
  rating: number;
  estimatedTime: string;
  tasks: number;
  subtasks: number;
  dependencies: number;
  author: {
    name: string;
    avatar?: string;
  };
  thumbnail?: string;
  isPublic: boolean;
  isFavorite: boolean;
  createdAt: string;
  lastUsed?: string;
}

interface TemplateGalleryProps {
  onSelectTemplate?: (template: Template) => void;
  onCreateNew?: () => void;
  onPreview?: (template: Template) => void;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  onSelectTemplate,
  onCreateNew,
  onPreview,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'name' | 'rating'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<number>>(new Set([1, 3, 5]));

  // Mock template data
  const templates: Template[] = [
    {
      id: 1,
      name: 'Software Development Sprint',
      description: 'Complete sprint template with user stories, development tasks, testing, and deployment phases.',
      category: 'Development',
      tags: ['agile', 'sprint', 'development', 'testing'],
      usageCount: 1245,
      rating: 4.8,
      estimatedTime: '2-3 weeks',
      tasks: 12,
      subtasks: 48,
      dependencies: 8,
      author: { name: 'John Doe', avatar: '/avatars/john.jpg' },
      thumbnail: '/templates/sprint.jpg',
      isPublic: true,
      isFavorite: true,
      createdAt: '2024-01-15',
      lastUsed: '2024-01-20',
    },
    {
      id: 2,
      name: 'Product Launch Checklist',
      description: 'Comprehensive checklist for launching a new product including marketing, PR, and technical tasks.',
      category: 'Marketing',
      tags: ['launch', 'marketing', 'checklist', 'product'],
      usageCount: 892,
      rating: 4.6,
      estimatedTime: '1-2 months',
      tasks: 25,
      subtasks: 75,
      dependencies: 15,
      author: { name: 'Sarah Wilson', avatar: '/avatars/sarah.jpg' },
      thumbnail: '/templates/launch.jpg',
      isPublic: true,
      isFavorite: false,
      createdAt: '2024-01-10',
    },
    {
      id: 3,
      name: 'Website Redesign Project',
      description: 'Complete website redesign workflow including research, design, development, and testing phases.',
      category: 'Design',
      tags: ['website', 'redesign', 'ux', 'development'],
      usageCount: 654,
      rating: 4.7,
      estimatedTime: '1-2 months',
      tasks: 18,
      subtasks: 54,
      dependencies: 12,
      author: { name: 'Mike Johnson', avatar: '/avatars/mike.jpg' },
      thumbnail: '/templates/redesign.jpg',
      isPublic: true,
      isFavorite: true,
      createdAt: '2024-01-08',
      lastUsed: '2024-01-18',
    },
    {
      id: 4,
      name: 'Content Calendar',
      description: 'Monthly content planning template with social media posts, blog articles, and email campaigns.',
      category: 'Content',
      tags: ['content', 'social media', 'blog', 'marketing'],
      usageCount: 1156,
      rating: 4.5,
      estimatedTime: '1 month',
      tasks: 8,
      subtasks: 32,
      dependencies: 4,
      author: { name: 'Emma Davis', avatar: '/avatars/emma.jpg' },
      thumbnail: '/templates/content.jpg',
      isPublic: true,
      isFavorite: false,
      createdAt: '2024-01-12',
    },
    {
      id: 5,
      name: 'Employee Onboarding',
      description: 'Structured onboarding process for new employees with tasks for HR, IT, and team managers.',
      category: 'HR',
      tags: ['onboarding', 'hr', 'employees', 'process'],
      usageCount: 423,
      rating: 4.9,
      estimatedTime: '2 weeks',
      tasks: 15,
      subtasks: 35,
      dependencies: 6,
      author: { name: 'David Kim', avatar: '/avatars/david.jpg' },
      thumbnail: '/templates/onboarding.jpg',
      isPublic: true,
      isFavorite: true,
      createdAt: '2024-01-05',
      lastUsed: '2024-01-19',
    },
    {
      id: 6,
      name: 'Event Planning Template',
      description: 'Complete event planning workflow from initial planning to post-event follow-up.',
      category: 'Events',
      tags: ['event', 'planning', 'coordination', 'logistics'],
      usageCount: 378,
      rating: 4.4,
      estimatedTime: '1-3 months',
      tasks: 20,
      subtasks: 60,
      dependencies: 10,
      author: { name: 'Lisa Chen', avatar: '/avatars/lisa.jpg' },
      thumbnail: '/templates/event.jpg',
      isPublic: true,
      isFavorite: false,
      createdAt: '2024-01-03',
    },
  ];

  const categories = [
    'all',
    'Development',
    'Marketing',
    'Design',
    'Content',
    'HR',
    'Events',
  ];

  const filteredAndSortedTemplates = React.useMemo(() => {
    let filtered = templates.filter(template => {
      const matchesSearch = searchTerm === '' || 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.usageCount - a.usageCount;
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [templates, searchTerm, selectedCategory, sortBy]);

  const toggleFavorite = (templateId: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(templateId)) {
        next.delete(templateId);
      } else {
        next.add(templateId);
      }
      return next;
    });
  };

  const TemplateCard: React.FC<{ template: Template; index: number }> = ({ template, index }) => (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200 group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      {/* Template Preview */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white">
              <DocumentDuplicateIcon className="w-12 h-12 mx-auto mb-2 opacity-80" />
              <div className="text-sm font-medium">{template.category}</div>
            </div>
          </div>
        )}
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-3">
          <button
            onClick={() => onPreview?.(template)}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
            title="Preview"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => onSelectTemplate?.(template)}
            className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors"
            title="Use Template"
          >
            <DocumentDuplicateIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => toggleFavorite(template.id)}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
        >
          {favorites.has(template.id) ? (
            <HeartIconSolid className="w-4 h-4 text-red-500" />
          ) : (
            <HeartIcon className="w-4 h-4 text-white" />
          )}
        </button>

        {/* Usage Badge */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
          {template.usageCount} uses
        </div>
      </div>

      {/* Template Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {template.name}
            </h3>
            
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(template.rating)
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                  {template.rating}
                </span>
              </div>
              
              <span className="text-gray-300 dark:text-gray-600">•</span>
              
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {template.category}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {template.description}
        </p>

        {/* Template Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-3 h-3" />
              <span>{template.estimatedTime}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <TagIcon className="w-3 h-3" />
              <span>{template.tasks} tasks</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <UserGroupIcon className="w-3 h-3" />
              <span>{template.dependencies} deps</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {template.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              #{tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{template.tags.length - 3}
            </span>
          )}
        </div>

        {/* Author */}
        <div className="flex items-center space-x-2">
          {template.author.avatar ? (
            <img
              src={template.author.avatar}
              alt={template.author.name}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {template.author.name.charAt(0)}
              </span>
            </div>
          )}
          <span className="text-sm text-gray-600 dark:text-gray-400">
            by {template.author.name}
          </span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Template Gallery
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Choose from our collection of pre-built project templates
            </p>
          </div>
          
          <button
            onClick={onCreateNew}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Template</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-3">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="popular">Most Popular</option>
              <option value="recent">Recently Added</option>
              <option value="name">Name A-Z</option>
              <option value="rating">Highest Rated</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'} transition-colors`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'} transition-colors`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredAndSortedTemplates.length} template{filteredAndSortedTemplates.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Template Grid */}
      <AnimatePresence>
        {filteredAndSortedTemplates.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FunnelIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No templates found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search criteria or create a new template
            </p>
          </motion.div>
        ) : (
          <motion.div
            className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}
            layout
          >
            {filteredAndSortedTemplates.map((template, index) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={index}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TemplateGallery;