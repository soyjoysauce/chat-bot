import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, Settings, Lightbulb, Code, Database, Eye, Trash2 } from 'lucide-react';

const DesignRequirementsBot = ({ projectPrompts, setProjectPrompts }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hi! I\'m your web application design assistant. Let\'s discuss your project and I\'ll help generate structured requirements. What component or section would you like to work on?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentProject, setCurrentProject] = useState('');
  const [requirements, setRequirements] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Default project templates
  const projectTemplates = {
    'E-commerce Platform': {
      rules: ['Must be responsive', 'Performance optimized', 'SEO friendly', 'Accessible (WCAG 2.1)'],
      blockers: ['No jQuery dependencies', 'Must support IE11+', 'GDPR compliant'],
      notes: 'Focus on conversion optimization and user experience',
      techStack: ['React', 'TypeScript', 'Node.js', 'WordPress headless']
    },
    'Corporate Website': {
      rules: ['Professional aesthetic', 'Fast loading', 'Multi-language support'],
      blockers: ['No animations on mobile', 'Must work without JavaScript'],
      notes: 'Emphasize credibility and brand consistency',
      techStack: ['PHP', 'WordPress', 'Sass', 'HTML/CSS']
    },
    'SaaS Dashboard': {
      rules: ['Real-time updates', 'Data visualization', 'Role-based permissions'],
      blockers: ['No page refreshes', 'Must handle large datasets'],
      notes: 'Focus on productivity and workflow efficiency',
      techStack: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS']
    }
  };

  // Combine default templates with custom project prompts
  const allProjectTemplates = {
    ...projectTemplates,
    ...projectPrompts
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeDesignInput = (input) => {
    const components = [];
    const functionality = [];
    const designElements = [];
    
    // Component detection
    const componentKeywords = ['header', 'footer', 'navbar', 'sidebar', 'modal', 'form', 'button', 'card', 'carousel', 'gallery', 'menu', 'dropdown', 'tabs', 'accordion'];
    const funcKeywords = ['login', 'register', 'search', 'filter', 'sort', 'pagination', 'upload', 'download', 'payment', 'checkout', 'dashboard', 'analytics'];
    const designKeywords = ['responsive', 'mobile', 'dark mode', 'light theme', 'animation', 'gradient', 'shadow', 'rounded', 'minimal', 'modern'];

    const lowerInput = input.toLowerCase();
    
    componentKeywords.forEach(keyword => {
      if (lowerInput.includes(keyword)) components.push(keyword);
    });
    
    funcKeywords.forEach(keyword => {
      if (lowerInput.includes(keyword)) functionality.push(keyword);
    });
    
    designKeywords.forEach(keyword => {
      if (lowerInput.includes(keyword)) designElements.push(keyword);
    });

    return { components, functionality, designElements };
  };

  const generateRequirements = (userInput, analysis) => {
    const projectConfig = allProjectTemplates[currentProject] || {};
    const newRequirements = [];

    // Functional requirements
    if (analysis.functionality.length > 0) {
      newRequirements.push({
        id: Date.now(),
        type: 'functional',
        title: 'Functional Requirements',
        items: analysis.functionality.map(func => ({
          requirement: `Implement ${func} functionality`,
          priority: 'high',
          techStack: projectConfig.techStack || ['React', 'TypeScript']
        }))
      });
    }

    // UI/UX requirements
    if (analysis.components.length > 0 || analysis.designElements.length > 0) {
      newRequirements.push({
        id: Date.now() + 1,
        type: 'ui-ux',
        title: 'UI/UX Requirements',
        items: [
          ...analysis.components.map(comp => ({
            requirement: `Design and implement ${comp} component`,
            priority: 'medium',
            techStack: ['React', 'Tailwind CSS', 'CSS']
          })),
          ...analysis.designElements.map(elem => ({
            requirement: `Implement ${elem} design pattern`,
            priority: 'low',
            techStack: ['CSS', 'Sass', 'Tailwind CSS']
          }))
        ]
      });
    }

    // Technical requirements (from project configuration)
    if (projectConfig.rules) {
      newRequirements.push({
        id: Date.now() + 2,
        type: 'technical',
        title: 'Technical Requirements',
        items: projectConfig.rules.map(rule => ({
          requirement: rule,
          priority: 'high',
          techStack: projectConfig.techStack || []
        }))
      });
    }

    // Constraints and blockers
    if (projectConfig.blockers) {
      newRequirements.push({
        id: Date.now() + 3,
        type: 'constraints',
        title: 'Constraints & Blockers',
        items: projectConfig.blockers.map(blocker => ({
          requirement: blocker,
          priority: 'critical',
          techStack: []
        }))
      });
    }

    return newRequirements;
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Analyze the input
    const analysis = analyzeDesignInput(inputMessage);
    const newReqs = generateRequirements(inputMessage, analysis);
    
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: generateBotResponse(analysis, newReqs),
        timestamp: new Date(),
        requirements: newReqs
      };
      
      setMessages(prev => [...prev, botResponse]);
      setRequirements(prev => [...prev, ...newReqs]);
      setIsTyping(false);
    }, 1500);

    setInputMessage('');
  };

  const generateBotResponse = (analysis, reqs) => {
    const { components, functionality, designElements } = analysis;
    
    let response = "Great! I've analyzed your design requirements. ";
    
    if (components.length > 0) {
      response += `I identified these components: ${components.join(', ')}. `;
    }
    
    if (functionality.length > 0) {
      response += `Key functionality includes: ${functionality.join(', ')}. `;
    }
    
    if (designElements.length > 0) {
      response += `Design elements to consider: ${designElements.join(', ')}. `;
    }
    
    response += `I've generated ${reqs.length} requirement categories for you. Would you like to discuss any specific aspect in more detail?`;
    
    return response;
  };

  const clearRequirements = () => {
    setRequirements([]);
  };

  const exportRequirements = () => {
    const exportData = {
      project: currentProject,
      timestamp: new Date().toISOString(),
      requirements: requirements
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentProject || 'requirements'}-${Date.now()}.json`;
    link.click();
  };

  const RequirementCard = ({ req }) => {
    const getTypeColor = (type) => {
      const colors = {
        functional: 'from-emerald-500 to-teal-600',
        'ui-ux': 'from-violet-500 to-purple-600',
        technical: 'from-blue-500 to-indigo-600',
        constraints: 'from-red-500 to-rose-600'
      };
      return colors[type] || 'from-gray-500 to-slate-600';
    };

    const getPriorityColor = (priority) => {
      const colors = {
        critical: 'bg-red-100 text-red-800 border-red-200',
        high: 'bg-orange-100 text-orange-800 border-orange-200',
        medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        low: 'bg-green-100 text-green-800 border-green-200'
      };
      return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
        <div className={`h-2 bg-gradient-to-r ${getTypeColor(req.type)}`}></div>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {req.type === 'functional' && <Code className="w-5 h-5 text-emerald-600" />}
            {req.type === 'ui-ux' && <Eye className="w-5 h-5 text-violet-600" />}
            {req.type === 'technical' && <Settings className="w-5 h-5 text-blue-600" />}
            {req.type === 'constraints' && <Database className="w-5 h-5 text-red-600" />}
            {req.title}
          </h3>
          <div className="space-y-3">
            {req.items.map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-gray-700 font-medium flex-1">{item.requirement}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                </div>
                {item.techStack && item.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.techStack.map((tech, techIdx) => (
                      <span key={techIdx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-200">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Design Requirements Bot</h1>
                <p className="text-sm text-gray-600">Transform design discussions into structured requirements</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={currentProject}
                onChange={(e) => setCurrentProject(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Project Type</option>
                {Object.keys(allProjectTemplates).map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Design Discussion</h2>
                <p className="text-sm text-gray-600">Describe your components, features, or design ideas</p>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <span className="text-xs opacity-75 mt-2 block">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[80%]">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Describe a component, feature, or design element..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Generated Requirements</h2>
                <div className="flex gap-2">
                  <button
                    onClick={exportRequirements}
                    disabled={requirements.length === 0}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Export
                  </button>
                  <button
                    onClick={clearRequirements}
                    disabled={requirements.length === 0}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {requirements.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {requirements.map((req) => (
                    <div key={req.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="font-medium text-gray-900 mb-2">{req.title}</h3>
                      <div className="space-y-2">
                        {req.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="text-sm text-gray-600 bg-white p-2 rounded border-l-4 border-blue-300">
                            {item.requirement}
                          </div>
                        ))}
                        {req.items.length > 2 && (
                          <p className="text-xs text-gray-500">+{req.items.length - 2} more requirements</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Start a discussion to generate requirements</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full Requirements View */}
        {requirements.length > 0 && (
          <div className="mt-12">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Detailed Requirements</h2>
              <p className="text-gray-600">Complete breakdown of your project requirements</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requirements.map((req) => (
                <RequirementCard key={req.id} req={req} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignRequirementsBot;