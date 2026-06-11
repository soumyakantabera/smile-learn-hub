import React from 'react';
import { Autocomplete, TextField, Chip } from '@mui/material';

interface TagAutocompleteProps {
  value: string[];
  options: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
}

export function TagAutocomplete({
  value,
  options,
  onChange,
  label = 'Tags',
  placeholder = 'Add tag and press Enter',
}: TagAutocompleteProps) {
  return (
    <Autocomplete
      multiple
      freeSolo
      options={options}
      value={value}
      onChange={(_, newValue) => onChange(newValue.map((v) => String(v).trim()).filter(Boolean))}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const { key, ...rest } = getTagProps({ index });
          return <Chip key={key} variant="outlined" label={option} size="small" {...rest} />;
        })
      }
      renderInput={(params) => <TextField {...params} label={label} placeholder={placeholder} fullWidth />}
    />
  );
}
