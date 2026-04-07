const codeSnippets = {
  'page-buttons': {
    html: `<button class="btn btn-md btn-primary">Primary</button>\n<button class="btn btn-sm btn-secondary">Secondary</button>\n<button class="btn btn-lg btn-outline">Outline</button>`,
    react: `import { Button } from '@design-system/components';\n\nexport const ActionRow = () => (\n  <div className="flex gap-4">\n    <Button variant="primary" size="md">Primary</Button>\n    <Button variant="secondary" size="sm">Secondary</Button>\n    <Button variant="outline" size="lg">Outline</Button>\n  </div>\n);`,
    css: `.btn { \n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: var(--radius-button);\n  transition: all 0.2s;\n}\n.btn-primary {\n  background: var(--accent);\n  color: white;\n}`,
    ts: `export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {\n  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';\n  size?: 'sm' | 'md' | 'lg';\n  isLoading?: boolean;\n}`
  },
  'page-badges': {
    html: `<span class="badge badge-default">Default</span>\n<span class="badge badge-success"><span class="badge-dot"></span> Active</span>`,
    react: `import { Badge } from '@design-system/components';\n\nconst Status = () => (\n  <Badge variant="success" showDot>\n    Active\n  </Badge>\n);`,
    css: `.badge {\n  display: inline-flex;\n  padding: 2px 8px;\n  border-radius: 9999px;\n  font-size: 0.75rem;\n  font-weight: 600;\n}`,
    ts: `export interface BadgeProps {\n  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';\n  solid?: boolean;\n  showDot?: boolean;\n  size?: 'sm' | 'md' | 'lg';\n  children: React.ReactNode;\n}`
  },
  'page-cards': {
    html: `<div class="card">\n  <div class="card-header">\n    <h3>Title</h3>\n  </div>\n  <div class="card-body">\n    <p>Content goes here.</p>\n  </div>\n</div>`,
    react: `import { Card, CardHeader, CardBody } from '@design-system/components';\n\nconst FeatureCard = () => (\n  <Card hoverable>\n    <CardHeader title="Title" />\n    <CardBody>\n      <p>Content goes here.</p>\n    </CardBody>\n  </Card>\n);`,
    css: `.card {\n  background: var(--surface);\n  border: 1px solid var(--border);\n  border-radius: var(--radius-card);\n  overflow: hidden;\n}`,
    ts: `export interface CardProps {\n  hoverable?: boolean;\n  interactive?: boolean;\n  children: React.ReactNode;\n}`
  },
  'page-forms': {
    html: `<div class="form-field">\n  <label class="form-label">Email</label>\n  <input class="input" type="email" placeholder="you@domain.com" />\n</div>`,
    react: `import { FormField, Input } from '@design-system/components';\n\nconst EmailInput = () => (\n  <FormField label="Email">\n    <Input type="email" placeholder="you@domain.com" />\n  </FormField>\n);`,
    css: `.input {\n  width: 100%;\n  padding: 10px 14px;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n}`,
    ts: `export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {\n  hasError?: boolean;\n  leftIcon?: React.ReactNode;\n}`
  },
  'page-toggles': {
    html: `<label class="toggle">\n  <input type="checkbox" checked />\n  <span class="toggle-slider"></span>\n  <span class="toggle-label">Notifications</span>\n</label>`,
    react: `import { Toggle } from '@design-system/components';\n\nconst Settings = () => (\n  <Toggle \n    label="Notifications" \n    defaultChecked={true} \n    onChange={(val) => console.log(val)}\n  />\n);`,
    css: `.toggle-slider {\n  width: 36px;\n  height: 20px;\n  background: var(--border);\n  border-radius: 20px;\n  position: relative;\n}`,
    ts: `export interface ToggleProps {\n  label?: string;\n  checked?: boolean;\n  defaultChecked?: boolean;\n  onChange?: (checked: boolean) => void;\n}`
  },
  'page-modals': {
    html: `<div class="modal-overlay">\n  <div class="modal">\n    <div class="modal-header">Title</div>\n    <div class="modal-body">Content</div>\n  </div>\n</div>`,
    react: `import { Modal } from '@design-system/components';\n\nconst Dialog = ({ isOpen, onClose }) => (\n  <Modal isOpen={isOpen} onClose={onClose} title="Title">\n    Content\n  </Modal>\n);`,
    css: `.modal-overlay {\n  position: fixed;\n  inset: 0;\n  background: rgba(0,0,0,0.5);\n  backdrop-filter: blur(4px);\n}`,
    ts: `export interface ModalProps {\n  isOpen: boolean;\n  onClose: () => void;\n  title?: string;\n  size?: 'sm' | 'md' | 'lg';\n  children: React.ReactNode;\n}`
  },
  'page-skeletons': {
    html: `<div class="skeleton-block" style="height:20px; width:60%"></div>`,
    react: `import { Skeleton } from '@design-system/components';\n\nconst LoadingLine = () => (\n  <Skeleton height="20px" width="60%" />\n);`,
    css: `.skeleton-block {\n  background: var(--border);\n  border-radius: 4px;\n  animation: pulse 1.5s infinite;\n}`,
    ts: `export interface SkeletonProps {\n  width?: string | number;\n  height?: string | number;\n  rounded?: boolean;\n}`
  }
};
