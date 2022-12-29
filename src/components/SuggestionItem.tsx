import { DatetimeSuggestion } from "../useSuggestions";
import classNames from "classnames";

type Props = {
  suggestion: DatetimeSuggestion;
  isSelected: boolean;
};

export const DatetimeSuggestionItem: React.FC<Props> = (props) => {
  const { suggestion, isSelected } = props;

  return (
    <div
      className={classNames(
        "text-white p-2 rounded text-lg flex items-center",
        { "bg-blue-400": isSelected },
      )}
    >
      <div className="flex-1">{suggestion.value}</div>
      <div className="text-xs text-right">
        <div>{suggestion.tz}</div>
        {suggestion.diffFromUTC && (
          <div className="text-[9px]">{suggestion.diffFromUTC}</div>
        )}
      </div>
    </div>
  );
};
