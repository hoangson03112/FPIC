import React from "react";
import SearchIcon from "@mui/icons-material/Search";
export default function SearchBox(){
    return (
        <div className="searchBox">
          <input className="searchInput" type="text" placeholder="Search..." />
          <button className="searchButton">
            <SearchIcon />
          </button>
        </div>
      );
}