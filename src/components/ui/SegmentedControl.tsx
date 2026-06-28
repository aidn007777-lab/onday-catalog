interface SegmentedControlProps<T extends string> {
  value: T;
  options: Array<{
    value: T;
    label: string;
  }>;
  ariaLabel: string;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  value,
  options,
  ariaLabel,
  onChange
}: SegmentedControlProps<T>) {
  return (
    <div className="segmented" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          className={option.value === value ? "is-selected" : ""}
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
