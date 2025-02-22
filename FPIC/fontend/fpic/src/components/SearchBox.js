import React, { useEffect, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import "./SearchBox.css";
import { debounce } from "lodash";
export default function SearchBox({onSearchChange}) {
    const debouncedSearch = useMemo(() =>
        debounce((search) =>{
            onSearchChange(search)
        }, 700),
        []
    )
    const handleOnSearchChange = (event) =>{
        debouncedSearch(event.target.value);
    }
    return (
        <div className="searchBox">
            <input 
            className="searchInput" 
            type="text" 
            placeholder="Search..." 
            onChange={handleOnSearchChange}
            />
            <button className="searchButton">
                <SearchIcon />
            </button>
        </div>
    )
}