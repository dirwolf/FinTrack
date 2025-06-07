import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="max-w-[280px] rounded-full bg-white shadow-sm flex items-center px-3 border border-gray-300">
      <Search className="h-4 w-4 text-gray-500 mr-2" />
      <Input
        type="text"
        placeholder="Search by name"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-2 text-sm"
      />
    </div>
  );
};

export default SearchBar;
