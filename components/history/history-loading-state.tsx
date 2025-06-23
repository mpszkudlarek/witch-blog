export default function LoadingState() {
    return (
        <div className="witch-card bg-black/50 text-center p-6">
            <div className="flex flex-col items-center space-y-4">
                <div className="moon-loader w-16 h-16"/>
                <p className="text-white/80 animate-pulse">Retrieving your cosmic memories...</p>
            </div>
        </div>
    )
}
