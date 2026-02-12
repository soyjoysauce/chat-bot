import React, { useState, useEffect } from 'react';
import { MessageSquare, Settings, FileText, Zap } from 'lucide-react';
import DesignRequirementsBot from './design-requirements-chatbot';
import ProjectConfigManager from './project-config-manager';

const WebDesignRequirementsApp = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [projectPrompts, setProjectPrompts] = useState({});

  // Load saved configurations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('projectPrompts');
    if (saved) {
      try {
        setProjectPrompts(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved configurations:', error);
      }
    }
  }, []);

  // Save configurations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('projectPrompts', JSON.stringify(projectPrompts));
  }, [projectPrompts]);

  const tabs = [
    {
      id: 'chat',
      label: 'Design Chat',
      icon: MessageSquare,
      description: 'Discuss designs and generate requirements'
    },
    {
      id: 'config',
      label: 'Project Config',
      icon: Settings,
      description: 'Manage project templates and prompts'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Main Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Web Design Requirements Assistant</h1>
                <p className="text-gray-600">Transform design discussions into structured, actionable requirements</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>PHP, JS, React, TS, Node.js Ready</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex-1 ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">{tab.label}</div>
                    <div className="text-xs opacity-75">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'chat' && (
          <div>
            <DesignRequirementsBot 
              projectPrompts={projectPrompts}
              setProjectPrompts={setProjectPrompts}
            />
          </div>
        )}

        {activeTab === 'config' && (
          <div>
            <ProjectConfigManager 
              projectPrompts={projectPrompts}
              setProjectPrompts={setProjectPrompts}
            />
          </div>
        )}
      </div>

      {/* Feature Highlights */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Natural Conversations</h3>
            <p className="text-gray-600 text-sm">Discuss your designs naturally. The AI understands components, features, and design patterns to generate relevant requirements.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Project Rules</h3>
            <p className="text-gray-600 text-sm">Define project-specific rules, blockers, and tech stacks. Create reusable templates for different types of projects.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Structured Output</h3>
            <p className="text-gray-600 text-sm">Get organized requirements categorized by type, priority, and technology stack. Export for project management tools.</p>
          </div>
        </div>
      </div>

      {/* Technology Stack Display */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
          <h3 className="text-xl font-bold mb-4">Optimized for Your Stack</h3>
          <div className="flex flex-wrap gap-3">
            {[
              'PHP', 'JavaScript', 'React', 'TypeScript', 'Node.js', 
              'HTML', 'CSS', 'Tailwind CSS', 'Sass', 'WordPress'
            ].map((tech) => (
              <span 
                key={tech} 
                className="px-4 py-2 bg-white/10 rounded-lg text-sm font-medium backdrop-blur-sm border border-white/20"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebDesignRequirementsApp;