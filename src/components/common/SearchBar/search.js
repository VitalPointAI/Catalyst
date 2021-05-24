import React from 'react'

// Material-UI Components
import SearchIcon from '@material-ui/icons/Search'

import './search.css'

const SearchBar = ({onChange, placeholder}) => {
    return (
      <div className="Search">
        <span className="SearchSpan">
          <SearchIcon />
        </span>
        <input
          className="SearchInput"
          type="text"
          onChange={onChange}
          placeholder={placeholder}
        />
      </div>
    )
  }

  export default SearchBar