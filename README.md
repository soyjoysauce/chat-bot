# Neural Bridge

A React-based application that converts design discussions into structured development requirements using simple keyword matching.

## What It Does

**Input:** Natural conversation about web components and features
```
"I need a responsive header with login and search functionality"
```

**Output:** Structured requirements categorized by type and priority
```json
{
  "functional": ["Implement login functionality", "Implement search functionality"],
  "ui-ux": ["Design and implement header component"],
  "technical": ["Implement responsive design pattern"],
  "techStack": ["React", "Tailwind CSS", "CSS"]
}
```

## How It Works

### Simple Keyword Detection
The app uses **basic string matching** to identify components and features:

```javascript
// Exact word matching - no AI or complex NLP
const componentKeywords = ['header', 'footer', 'navbar', 'modal', 'form'];
const funcKeywords = ['login', 'search', 'filter', 'upload', 'payment'];
const designKeywords = ['responsive', 'mobile', 'dark mode', 'animation'];
```

**Limitations:**
- Only catches exact keyword matches
- No synonyms (won't catch "nav bar" if only "navbar" is defined)
- No context understanding
- No complex sentence parsing

## Features

- **Chat Interface** - Discuss design ideas naturally
- **Keyword Analysis** - Detects components, functionality, and design patterns
- **Project Templates** - Create reusable configurations with custom rules
- **Structured Output** - Requirements organized by category and priority
- **Export/Import** - Save and share project configurations

## Quick Start

```bash
# Install dependencies
npm install

# Import components and start
npm start
```

## File Structure

- **`web-design-requirements-app.jsx`** - Main app with tabs and state management
- **`design-requirements-chatbot.jsx`** - Chat interface and keyword analysis engine
- **`project-config-manager.jsx`** - Project template configuration system

---

**Simple, effective requirement generation through structured conversations.**