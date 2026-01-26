import { Input } from '@finding-good/shared'

interface SomethingElseRowProps {
  checked: boolean
  text: string
  onToggle: (checked: boolean) => void
  onTextChange: (text: string) => void
}

export function SomethingElseRow({
  checked,
  text,
  onToggle,
  onTextChange,
}: SomethingElseRowProps) {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggle(e.target.checked)
  }

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      {/* Checkbox + Label */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleCheckboxChange}
          className="mt-0.5 w-5 h-5 rounded border-purple-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
        />
        <span className={`font-medium ${checked ? 'text-purple-900' : 'text-purple-700'}`}>
          Something else emerged
        </span>
      </label>

      {/* Text input - only show when checked */}
      {checked && (
        <div className="mt-3 ml-8">
          <Input
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="What came up for you today?"
            className="bg-white"
          />
        </div>
      )}
    </div>
  )
}
