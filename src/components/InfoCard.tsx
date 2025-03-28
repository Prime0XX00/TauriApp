interface InfoCardProps {
	iconName: string;
	text: string;
	count: number;
}

const InfoCard = ({ iconName, text, count }: InfoCardProps) => {
	return (
		<div className="bg-white border flex items-center space-x-5 grow border-slate-200 px-8 py-5 rounded-md">
			<span className="material-symbols-rounded !text-4xl bg-slate-100 p-2 rounded-md">
				{iconName}
			</span>
			<div className="flex flex-col h-full justify-between">
				<p>{text}</p>
				<p className="text-3xl font-bold">{count}</p>
			</div>
		</div>
	);
};

export default InfoCard;
