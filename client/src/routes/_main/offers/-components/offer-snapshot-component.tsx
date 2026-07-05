import { Button } from "@/components";

type Props = {
  version: number;
  changes: Array<string>;
};

export default function OfferSnapshot(props: Props) {

  return (
    <div className="flex relative gap-3.25 py-3.5 border-b border-(--border)">
      {/* vertical-rail */}
      <div className="flex flex-col items-center shrink-0 pt-0.75">
        {/* vertical-dot */}
        <div className="w-2.75 h-2.75 rounded-full border border-(--primary-800) bg-(--primary-800) shadow-[0_0_0_4px_var(--success-subtle)]"></div>

        {/* vertical-line */}
        <div className="w-[2px] flex-1 bg-(--success-subtle) m-t-[4px]"></div>
      </div>

      {/* main */}
      <div className="flex-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[13px] font-semibold">v4</span>
          <span className="text-[10px] font-bold text-(--primary-600) bg-(--success-subtle) py-0.5 px-2 rounded-full">
            CURRENT
          </span>
        </div>

        {/* when */}
        <div className="text-[11px] text-(--fg-3) mt-0.5">
          14 Jun 2026, 09:42 · j.morel
        </div>

        {/* changes */}
        <div className="mt-2 flex flex-col gap-1 ">
          <div className="flex gap-1 text-[12px] text-(--fg-3) text-1/4 before:content-[' '] before:w-1 before:h-1 before:rounded-full before:bg-(--fg-3) before:shrink-0 before:mt-1.5">
            Volume discount raised from 8 % to 12 % (1.001–5.000 band)
          </div>
          <div className="flex gap-1 text-[12px] text-(--fg-3) text-1/4 before:content-[' '] before:w-1 before:h-1 before:rounded-full before:bg-(--fg-3) before:shrink-0 before:mt-1.5">
            Term extended to 36 months
          </div>
        </div>

        {/* actions */}
        <div className="mt-2.5 flex gap-1.5 flex-wrap">
          <Button size="xs" variant="secondary">
            Restore this version
          </Button>
        </div>
      </div>
    </div>
  );
}
