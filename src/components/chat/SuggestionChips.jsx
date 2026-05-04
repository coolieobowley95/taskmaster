const suggestions = [
  '📋 Plan my day',
  '💡 Suggest healthy habits',
  '🎯 Help me set goals',
  '⏰ Create a morning routine',
  '📊 Analyze my productivity',
];

export default function SuggestionChips({ onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 px-4">
      {suggestions.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="text-xs font-medium px-3 py-2 rounded-xl bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200"
        >
          {s}
        </button>
      ))}
    </div>
  );
}