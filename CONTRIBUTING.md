<div align="center">

# 🤝 Contributing to The Midnight Brew

### *Thank you for considering contributing to our cozy digital café!*

```
☕ Every contribution, no matter how small, helps us brew something special ✨
```

<img src="https://img.shields.io/badge/Contributions-Welcome-8B4513?style=for-the-badge" alt="Contributions Welcome" />
<img src="https://img.shields.io/badge/PRs-Welcome-D2691E?style=for-the-badge" alt="PRs Welcome" />
<img src="https://img.shields.io/badge/Issues-Welcome-A0522D?style=for-the-badge" alt="Issues Welcome" />

</div>

---

## 📋 Table of Contents

- [🌟 How Can I Contribute?](#-how-can-i-contribute)
- [🐛 Reporting Bugs](#-reporting-bugs)
- [💡 Suggesting Features](#-suggesting-features)
- [🔧 Development Setup](#-development-setup)
- [📝 Pull Request Process](#-pull-request-process)
- [💻 Coding Guidelines](#-coding-guidelines)
- [🎨 Design Guidelines](#-design-guidelines)
- [✅ Commit Message Guidelines](#-commit-message-guidelines)
- [📜 Code of Conduct](#-code-of-conduct)

---

## 🌟 How Can I Contribute?

<div align="center">

<table>
<tr>
<td width="25%" align="center">

### 🐛
**Report Bugs**

Find and report issues to help us improve

[Report Bug](https://github.com/KrishnaSaxena108/The-Midnight-Brew/issues/new?labels=bug)

</td>
<td width="25%" align="center">

### 💡
**Suggest Ideas**

Share your creative ideas for new features

[Suggest Feature](https://github.com/KrishnaSaxena108/The-Midnight-Brew/issues/new?labels=enhancement)

</td>
<td width="25%" align="center">

### 🔧
**Fix Issues**

Pick an issue and submit a fix

[View Issues](https://github.com/KrishnaSaxena108/The-Midnight-Brew/issues)

</td>
<td width="25%" align="center">

### 📝
**Improve Docs**

Help make our documentation better

[Contribute](https://github.com/KrishnaSaxena108/The-Midnight-Brew)

</td>
</tr>
</table>

</div>

### 🎯 Contribution Areas

We welcome contributions in the following areas:

- 🐛 **Bug Fixes** - Help squash those pesky bugs
- ✨ **New Features** - Add exciting new functionality
- 🎨 **UI/UX Improvements** - Enhance the visual experience
- 📱 **Responsive Design** - Improve mobile experience
- ♿ **Accessibility** - Make our café accessible to everyone
- 🔒 **Security** - Strengthen our security measures
- 📝 **Documentation** - Improve guides and documentation
- 🌍 **Translations** - Help us reach a global audience
- ⚡ **Performance** - Optimize code and improve speed
- 🧪 **Testing** - Write tests to ensure quality

---

## 🐛 Reporting Bugs

Before creating a bug report, please check the [existing issues](https://github.com/KrishnaSaxena108/The-Midnight-Brew/issues) to avoid duplicates.

### 📝 How to Submit a Good Bug Report

When filing a bug report, please include:

1. **Clear Title** - Be specific and descriptive
2. **Description** - Explain what happened vs. what you expected
3. **Steps to Reproduce** - Detailed steps to reproduce the issue
4. **Screenshots** - If applicable, add screenshots
5. **Environment Details**:
   - OS (Windows, macOS, Linux)
   - Browser (Chrome, Firefox, Safari, etc.)
   - Browser Version
   - Node.js Version (if backend issue)

### 🔖 Bug Report Template

```markdown
## Bug Description
A clear description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Screenshots
If applicable, add screenshots.

## Environment
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

## Additional Context
Any other relevant information.
```

---

## 💡 Suggesting Features

We love hearing your ideas! Before suggesting a feature:

1. **Check existing issues** to see if it's already been suggested
2. **Search closed issues** in case it was previously discussed
3. **Consider if it fits** the project's scope and vision

### ✨ Feature Request Template

```markdown
## Feature Description
A clear description of the feature you'd like to see.

## Problem it Solves
Explain the problem this feature would solve.

## Proposed Solution
Describe how you envision this feature working.

## Alternative Solutions
Any alternative solutions you've considered.

## Additional Context
Screenshots, mockups, or examples from other projects.

## Benefits
- Benefit 1
- Benefit 2
- Benefit 3
```

---

## 🔧 Development Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (v4.4 or higher)
- **Git**

### 🚀 Getting Started

1. **Fork the Repository**
   
   Click the "Fork" button at the top right of the repository page.

2. **Clone Your Fork**
   
   ```bash
   git clone https://github.com/KrishnaSaxena108/The-Midnight-Brew.git
   cd The-Midnight-Brew
   ```

3. **Add Upstream Remote**
   
   ```bash
   git remote add upstream https://github.com/KrishnaSaxena108/The-Midnight-Brew.git
   ```

4. **Install Dependencies**
   
   ```bash
   npm install
   ```

5. **Set Up Environment Variables**
   
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. **Start Development Server**
   
   ```bash
   npm run dev
   ```

7. **Open in Browser**
   
   Navigate to `http://localhost:3000`

---

## 📝 Pull Request Process

### ✅ Before Submitting

1. **Create a new branch** for your feature/fix
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit them (see commit guidelines below)

3. **Test thoroughly** - Ensure your changes work as expected

4. **Update documentation** if needed

5. **Keep commits clean** - Squash unnecessary commits

### 🚀 Submitting Your PR

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request** on GitHub

3. **Fill out the PR template** with all required information

4. **Link related issues** using keywords (Fixes #123, Closes #456)

5. **Wait for review** - Be patient and responsive to feedback

### 📋 Pull Request Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #(issue number)

## Changes Made
- Change 1
- Change 2
- Change 3

## Screenshots (if applicable)
Add screenshots here.

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested my changes thoroughly
- [ ] Any dependent changes have been merged

## Additional Notes
Any additional information reviewers should know.
```

### ⏱️ Review Process

- PRs are typically reviewed within **2-5 business days**
- Maintainers may request changes or ask questions
- Once approved, your PR will be merged
- You'll be added to our contributors list! 🎉

---

## 💻 Coding Guidelines

### 🎨 Code Style

#### JavaScript
- Use **ES6+ syntax** where appropriate
- Use **const** and **let** instead of **var**
- Use **arrow functions** for callbacks
- Use **template literals** for string concatenation
- Add **semicolons** at the end of statements
- Use **2 spaces** for indentation

```javascript
// ✅ Good
const greeting = (name) => {
  return `Hello, ${name}!`;
};

// ❌ Bad
var greeting = function(name) {
  return 'Hello, ' + name + '!'
}
```

#### CSS
- Use **meaningful class names** (BEM notation preferred)
- Group related properties together
- Use **CSS variables** for colors and common values
- Add comments for complex sections
- Keep selectors simple and avoid deep nesting

```css
/* ✅ Good */
.menu-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--color-primary);
}

/* ❌ Bad */
.menu .item div {
  display: flex;
  align-items: center;
}
```

#### HTML
- Use **semantic HTML5** elements
- Add **alt text** to images
- Use proper **heading hierarchy**
- Keep markup clean and readable
- Add **ARIA labels** where appropriate

```html
<!-- ✅ Good -->
<nav aria-label="Main navigation">
  <ul class="nav-list">
    <li class="nav-item">
      <a href="#home" class="nav-link">Home</a>
    </li>
  </ul>
</nav>

<!-- ❌ Bad -->
<div class="nav">
  <div>
    <a href="#home">Home</a>
  </div>
</div>
```

### 🔒 Security Best Practices

- **Never commit** sensitive data (API keys, passwords)
- **Validate** all user inputs
- **Sanitize** data before database operations
- Use **environment variables** for configuration
- Follow **OWASP** security guidelines

### ⚡ Performance Guidelines

- **Optimize images** before committing
- **Minimize HTTP requests**
- **Use async/await** for asynchronous operations
- **Avoid memory leaks**
- **Cache when appropriate**

---

## 🎨 Design Guidelines

### 🎨 Color Palette

Stick to our established color scheme:

- **Primary**: `#8B4513` (Saddle Brown)
- **Secondary**: `#D2691E` (Chocolate)
- **Accent**: `#A0522D` (Sienna)
- **Dark**: `#2C1810` (Dark Brown)
- **Light**: `#F5F5DC` (Beige)

### 🖋️ Typography

- **Headings**: Playfair Display
- **Body**: System fonts / Sans-serif
- **Code**: Monospace

### 📐 Spacing

Use consistent spacing throughout:
- Small: `8px`
- Medium: `16px`
- Large: `24px`
- Extra Large: `32px`

### 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

---

## ✅ Commit Message Guidelines

Write clear, meaningful commit messages following this format:

### 📝 Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 🏷️ Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### ✨ Examples

```bash
# Good commits
feat(menu): add coffee filter functionality
fix(auth): resolve JWT token expiration issue
docs(readme): update installation instructions
style(css): improve button hover effects

# Bad commits
fixed stuff
update
changes
asdfgh
```

### 📋 Commit Message Rules

- Use **present tense** ("add" not "added")
- Use **imperative mood** ("move" not "moves")
- Keep **subject line under 50 characters**
- Capitalize the subject line
- Don't end with a period
- Add detailed description in body if needed

---

## 📜 Code of Conduct

### 🤝 Our Pledge

We are committed to providing a welcoming and inclusive environment for everyone, regardless of:

- Age
- Body size
- Disability
- Ethnicity
- Gender identity and expression
- Level of experience
- Nationality
- Personal appearance
- Race
- Religion
- Sexual identity and orientation

### ✨ Our Standards

**Positive Behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what's best for the community
- Showing empathy towards others

**Unacceptable Behavior:**
- Trolling, insulting, or derogatory comments
- Personal or political attacks
- Public or private harassment
- Publishing others' private information
- Any conduct which could reasonably be considered inappropriate

### 🚨 Reporting Issues

If you experience or witness unacceptable behavior, please report it by contacting the project maintainer at the repository's issue tracker.

---

## 🎉 Recognition

### 🌟 Contributors

All contributors will be recognized in:
- Our [README.md](README.md) contributors section
- Release notes for their contributions
- Special shoutouts in our community

### 🏆 Contribution Levels

- **☕ Coffee Enthusiast** - 1-5 contributions
- **🌟 Regular Brewer** - 6-15 contributions
- **🚀 Master Barista** - 16+ contributions
- **💎 Core Team** - Consistent, high-quality contributions

---

## 💬 Questions?

<div align="center">

### Need Help or Have Questions?

<br>

<table>
<tr>
<td width="50%" align="center">

### 💬
**GitHub Discussions**

[Ask a Question](https://github.com/KrishnaSaxena108/The-Midnight-Brew/discussions)

</td>
<td width="50%" align="center">

### 📧
**GitHub Issues**

[Open an Issue](https://github.com/KrishnaSaxena108/The-Midnight-Brew/issues)

</td>
</tr>
</table>

</div>

---

<div align="center">

## 🙏 Thank You!

<br>

```
☕ Your contributions make The Midnight Brew special ✨
```

<br>

**We appreciate every contribution, big or small!**

*Happy coding and enjoy your virtual coffee!* ☕🌙

<br>

---

<br>

[![Contributors](https://img.shields.io/github/contributors/KrishnaSaxena108/The-Midnight-Brew?style=for-the-badge&color=8B4513)](https://github.com/KrishnaSaxena108/The-Midnight-Brew/graphs/contributors)
[![Pull Requests](https://img.shields.io/github/issues-pr/KrishnaSaxena108/The-Midnight-Brew?style=for-the-badge&color=D2691E)](https://github.com/KrishnaSaxena108/The-Midnight-Brew/pulls)
[![Issues](https://img.shields.io/github/issues/KrishnaSaxena108/The-Midnight-Brew?style=for-the-badge&color=A0522D)](https://github.com/KrishnaSaxena108/The-Midnight-Brew/issues)

<br>

**[⬆ Back to Top](#-contributing-to-the-midnight-brew)**

</div>
