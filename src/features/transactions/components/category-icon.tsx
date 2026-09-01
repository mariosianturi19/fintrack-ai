import { DotsThree } from "@phosphor-icons/react/dist/ssr/DotsThree";
import { FirstAid } from "@phosphor-icons/react/dist/ssr/FirstAid";
import { ForkKnife } from "@phosphor-icons/react/dist/ssr/ForkKnife";
import { Lightning } from "@phosphor-icons/react/dist/ssr/Lightning";
import { ShoppingBag } from "@phosphor-icons/react/dist/ssr/ShoppingBag";
import { Train } from "@phosphor-icons/react/dist/ssr/Train";

import type { TransactionCategory } from "../domain";

type CategoryIconProps = Readonly<{
  category: TransactionCategory;
  size?: "compact" | "regular";
}>;

function CategoryGlyph({ slug, size }: { slug: string; size: number }) {
  const iconProps = {
    "aria-hidden": true,
    size,
    weight: "regular",
  } as const;

  switch (slug) {
    case "food-drink":
      return <ForkKnife {...iconProps} />;
    case "transportation":
      return <Train {...iconProps} />;
    case "shopping":
      return <ShoppingBag {...iconProps} />;
    case "bills":
      return <Lightning {...iconProps} />;
    case "health":
      return <FirstAid {...iconProps} />;
    default:
      return <DotsThree {...iconProps} />;
  }
}

export function CategoryIcon({
  category,
  size = "regular",
}: CategoryIconProps) {
  const compact = size === "compact";

  return (
    <span
      aria-hidden="true"
      className={[
        "flex shrink-0 items-center justify-center rounded-md",
        compact ? "size-9" : "size-11",
      ].join(" ")}
      style={{
        backgroundColor: `${category.colorHex}1A`,
        color: category.colorHex,
      }}
    >
      <CategoryGlyph size={compact ? 18 : 20} slug={category.slug} />
    </span>
  );
}
