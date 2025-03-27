import { ReactNode, useState, useEffect, useRef } from "react";

interface TooltipProps {
	content: ReactNode;
	children: ReactNode;
	position?: "top" | "bottom" | "left" | "right" | "middle";
}

const getPositionClass = (position: string) => {
	switch (position) {
		case "top":
			return "-top-full left-1/2 -translate-x-1/2";
		case "left":
			return "-translate-x-full top-1/2 -translate-y-1/2";
		case "bottom":
			return "top-full left-1/2 -translate-x-1/2";
		case "right":
			return "left-full top-1/2 -translate-y-1/2";
	}
};

const Tooltip = ({ content, children, position = "top" }: TooltipProps) => {
	const [isVisible, setIsVisible] = useState(false);
	const tooltipRef = useRef<HTMLDivElement | null>(null);

	const showTooltip = () => {
		setIsVisible(true);
	};

	const hideTooltip = () => setIsVisible(false);

	return (
		<>
			<div
				className="relative flex w-fit h-fit"
				onMouseEnter={() => showTooltip()}
				onMouseLeave={hideTooltip}
			>
				{isVisible && (
					<div
						ref={tooltipRef}
						className={`${getPositionClass(
							position
						)} absolute !m-0 pointer-events-none z-[9999] text-nowrap  bg-slate-900/90 text-white rounded-sm px-2 py-1`}
					>
						{content}
					</div>
				)}

				{children}
			</div>
		</>
	);
};

export default Tooltip;
