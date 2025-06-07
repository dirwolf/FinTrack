import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export const Header = () => {
  return (
    <header className="bg-white border-b border-gray-300 shadow-lg h-16 w-full">
      <div className="flex justify-between items-center h-full px-8">
        <h1 className="font-normal text-2xl flex items-center text-[#272727]">
          <span className="text-[#048DFF]">K</span>UBER
        </h1>

        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback className="bg-[#048DFF] text-white font-medium text-sm">V</AvatarFallback>
          </Avatar>
          <span className="text-sm text-[#1F271B] font-medium">Vinod Singh</span>
        </div>
      </div>
    </header>
  )
}


// import React from 'react';
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// function Header({ title }) {
//   return (
//     <header className="flex h-16 items-center border-b px-4 md:px-6">
//       <h1 className="text-lg font-semibold">{title}</h1>
//       <div className="ml-auto flex items-center gap-4">
//         <Avatar>
//           <AvatarFallback className="bg-blue-500 text-white">VS</AvatarFallback>
//         </Avatar>
//         <span className="hidden md:inline-block">Vinod Singh</span>
//       </div>
//     </header>
//   );
// }

// export default Header;

