import { Plus, RefreshCw } from "lucide-react";

const mockRooms = [
  { id: 1, name: "F2 AutoDesk",  capacity: 20 },
  { id: 2, name: "F3 GitHub", capacity: 24 },
];

export default function Rooms(){

    return(
        <>
            
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-800">Xonalar</h2>
                <button className="text-gray-400 hover:text-[#3d5af1] transition-colors">
                    <RefreshCw className="w-4 h-4" />
                </button>
                </div>

                <div className="flex items-center gap-3">
                {/* Add button */}
                <button className="flex items-center gap-2 bg-[#3d5af1] hover:bg-[#2a47d6] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" />
                    Xona qo'shish
                </button>
                </div>
            </div>

            {/* Room Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {mockRooms.map((room) => (
                <div
                    key={room.id}
                    className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow cursor-pointer"
                >
                    <h3 className="font-semibold text-gray-800 mb-3">{room.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>Sig'imi: {room.capacity} ta talaba</span>
                    </div>
                </div>
                ))}

                {mockRooms.length === 0 && (
                <p className="text-sm text-gray-400 col-span-full text-center py-8">
                    Xonalar topilmadi
                </p>
                )}
            </div>
            </div>
        
        </>
    )
}