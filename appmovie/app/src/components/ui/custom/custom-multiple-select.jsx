import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Check, ChevronsUpDown, X, AlertCircle } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CustomMultiSelect({
    field,
    data = [],
    label,
    getOptionLabel,
    getOptionValue,
    error,
    placeholder,
}) {
    const [open, setOpen] = useState(false);

    const selectedValues = useMemo(() => field.value || [], [field.value]);

    const toggleValue = (val) => {
        const value = String(val);
        const newValues = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];

        field.onChange(newValues);
    };

    const handleRemove = (e, value) => {
        e.preventDefault();
        e.stopPropagation();
        field.onChange(selectedValues.filter((v) => v !== value));
    };

    const selectedItems = useMemo(
        () =>
            data.filter((item) =>
                selectedValues.includes(String(getOptionValue(item)))
            ),
        [data, selectedValues, getOptionValue]
    );

    return (
        <div className="w-full space-y-2">
            {label && (
                <label className="text-sm font-medium text-white/85">{label}</label>
            )}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "h-11 w-full justify-between rounded-2xl border px-3 font-normal text-sm transition-all",
                            "border-white/10 bg-black/20 text-white hover:bg-white/[0.06] hover:text-white",
                            "focus-visible:ring-2 focus-visible:ring-violet-400/30",
                            error && "border-red-400/50 focus-visible:ring-red-400/20",
                            selectedItems.length === 0 && "text-white/40"
                        )}
                    >
                        <span className="truncate">
                            {selectedItems.length > 0
                                ? `${selectedItems.length} seleccionado(s)`
                                : placeholder || `Seleccionar ${label.toLowerCase()}`}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    className="z-50 min-w-[var(--radix-popover-trigger-width)] rounded-2xl border border-white/10 bg-[#0f172a] p-0 text-white shadow-2xl"
                    align="start"
                >
                    <Command className="bg-transparent">
                        <CommandInput
                            placeholder={`Buscar ${label.toLowerCase()}...`}
                            className="text-white placeholder:text-white/40"
                        />
                        <CommandList className="max-h-64">
                            <CommandEmpty className="py-6 text-center text-sm text-white/50">
                                No se encontraron resultados.
                            </CommandEmpty>
                            <CommandGroup>
                                {data.map((item) => {
                                    const value = String(getOptionValue(item));
                                    const isSelected = selectedValues.includes(value);

                                    return (
                                        <CommandItem
                                            key={value}
                                            value={getOptionLabel(item)}
                                            onSelect={() => toggleValue(value)}
                                            className={cn(
                                                "cursor-pointer rounded-xl mx-1 my-0.5 px-2 py-2 transition-colors",
                                                isSelected
                                                    ? "bg-violet-500/20 text-white"
                                                    : "text-white/85 hover:bg-violet-500/10 hover:text-white"
                                            )}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4 text-violet-300",
                                                    isSelected ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {getOptionLabel(item)}
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {selectedItems.map((item) => {
                        const value = String(getOptionValue(item));
                        return (
                            <span
                                key={value}
                                className="inline-flex items-center gap-1 rounded-full border border-violet-400/20 bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-100"
                            >
                                {getOptionLabel(item)}
                                <button
                                    type="button"
                                    onClick={(e) => handleRemove(e, value)}
                                    className="rounded-full p-0.5 text-violet-200 transition hover:bg-white/10 hover:text-white"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}

            {error && (
                <p className="flex items-center gap-1.5 text-sm font-medium text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </p>
            )}
        </div>
    );
}

CustomMultiSelect.propTypes = {
    field: PropTypes.shape({
        value: PropTypes.array,
        onChange: PropTypes.func.isRequired,
    }).isRequired,
    data: PropTypes.array,
    label: PropTypes.string.isRequired,
    getOptionLabel: PropTypes.func.isRequired,
    getOptionValue: PropTypes.func.isRequired,
    error: PropTypes.string,
    placeholder: PropTypes.string,
};