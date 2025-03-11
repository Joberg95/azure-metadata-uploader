import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";

interface TableSearchProps {
  onSearch?: (searchTerm: string) => void;
}

export default function TableSearch({ onSearch }: TableSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const previousSearchTermRef = useRef("");

  useEffect(() => {
    if (previousSearchTermRef.current === searchTerm) {
      return;
    }

    previousSearchTermRef.current = searchTerm;

    if (typeof onSearch === "function") {
      onSearch(searchTerm);
    }
  }, [searchTerm, onSearch]);

  const handleSearch = () => {
    if (typeof onSearch === "function") {
      onSearch(searchTerm);
    } else {
      console.log("Search term:", searchTerm);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex items-center">
      <div className="flex w-64">
        <Input
          placeholder="Search for document number"
          className="rounded-md h-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
