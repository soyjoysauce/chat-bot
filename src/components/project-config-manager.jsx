import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Save, X, Copy, Download, Upload } from 'lucide-react';

const ProjectConfigManager = ({ projectPrompts, onSaveConfig, onDeleteConfig, onImportConfigs }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    rules: [''],
    blockers: [''],
    notes: '',
    techStack: [''],
    customPrompts: {
      component: '',
      functionality: '',
      design: '',
      validation: ''
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      rules: [''],
      blockers: [''],
      notes: '',
      techStack: [''],
      customPrompts: {
        component: '',
        functionality: '',
        design: '',
        validation: ''
      }
    });
  };

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project,
        ...projectPrompts[project]
      });
    } else {
      setEditingProject(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    resetForm();
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const handleAddArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const handleRemoveArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handlePromptChange = (promptType, value) => {
    setFormData(prev => ({
      ...prev,
      customPrompts: {
        ...prev.customPrompts,
        [promptType]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    const projectConfig = {
      rules: formData.rules.filter(rule => rule.trim()),
      blockers: formData.blockers.filter(blocker => blocker.trim()),
      notes: formData.notes,
      techStack: formData.techStack.filter(tech => tech.trim()),
      customPrompts: formData.customPrompts
    };

    await onSaveConfig(formData.name, projectConfig, editingProject);
    handleCloseModal();
  };

  const handleDelete = async (projectName) => {
    if (window.confirm(`Are you sure you want to delete "${projectName}"?`)) {
      await onDeleteConfig(projectName);
    }
  };

  const handleDuplicate = async (projectName) => {
    const config = projectPrompts[projectName];
    const newName = `${projectName} - Copy`;
    await onSaveConfig(newName, { ...config });
  };

  const exportConfigs = () => {
    const dataStr = JSON.stringify(projectPrompts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `project-configs-${Date.now()}.json`;
    link.click();
  };

  const importConfigs = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          await onImportConfigs(imported);
        } catch (error) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Project Configurations</h2>
          <p className="text-sm text-gray-600">Manage custom prompts, rules, and settings for different project types</p>
        </div>
        <div className="flex gap-2">
          <label className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={importConfigs}
              className="hidden"
            />
          </label>
          <button
            onClick={exportConfigs}
            className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      {/* Project List */}
      <div className="space-y-4">
        {Object.keys(projectPrompts).map(projectName => (
          <div key={projectName} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{projectName}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Rules:</span>
                    <span className="ml-2 text-gray-600">{projectPrompts[projectName].rules?.length || 0}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Blockers:</span>
                    <span className="ml-2 text-gray-600">{projectPrompts[projectName].blockers?.length || 0}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tech Stack:</span>
                    <span className="ml-2 text-gray-600">{projectPrompts[projectName].techStack?.length || 0}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Custom Prompts:</span>
                    <span className="ml-2 text-gray-600">
                      {Object.values(projectPrompts[projectName].customPrompts || {}).filter(Boolean).length}
                    </span>
                  </div>
                </div>
                {projectPrompts[projectName].notes && (
                  <p className="mt-2 text-sm text-gray-600 italic">{projectPrompts[projectName].notes}</p>
                )}
                {projectPrompts[projectName].techStack?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {projectPrompts[projectName].techStack.map((tech, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDuplicate(projectName)}
                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenModal(projectName)}
                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(projectName)}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {Object.keys(projectPrompts).length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">No project configurations yet</p>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create your first project
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingProject ? `Edit ${editingProject}` : 'New Project Configuration'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Project Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., E-commerce Platform, SaaS Dashboard"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rules Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Rules
                  </label>
                  <div className="space-y-2">
                    {formData.rules.map((rule, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={rule}
                          onChange={(e) => handleArrayChange('rules', idx, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="e.g., Must be responsive"
                        />
                        {formData.rules.length > 1 && (
                          <button
                            onClick={() => handleRemoveArrayItem('rules', idx)}
                            className="p-2 text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => handleAddArrayItem('rules')}
                      className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Rule
                    </button>
                  </div>
                </div>

                {/* Blockers Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blockers & Constraints
                  </label>
                  <div className="space-y-2">
                    {formData.blockers.map((blocker, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={blocker}
                          onChange={(e) => handleArrayChange('blockers', idx, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="e.g., No jQuery dependencies"
                        />
                        {formData.blockers.length > 1 && (
                          <button
                            onClick={() => handleRemoveArrayItem('blockers', idx)}
                            className="p-2 text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => handleAddArrayItem('blockers')}
                      className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Blocker
                    </button>
                  </div>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tech Stack
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {formData.techStack.map((tech, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={tech}
                        onChange={(e) => handleArrayChange('techStack', idx, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="e.g., React"
                      />
                      {formData.techStack.length > 1 && (
                        <button
                          onClick={() => handleRemoveArrayItem('techStack', idx)}
                          className="p-2 text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleAddArrayItem('techStack')}
                  className="mt-2 text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Technology
                </button>
              </div>

              {/* Notes */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes, context, or special considerations..."
                />
              </div>

              {/* Custom Prompts */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Custom Prompts</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {Object.keys(formData.customPrompts).map(promptType => (
                    <div key={promptType}>
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                        {promptType} Prompt
                      </label>
                      <textarea
                        value={formData.customPrompts[promptType]}
                        onChange={(e) => handlePromptChange(promptType, e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder={`Custom ${promptType} requirements or guidelines...`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectConfigManager;