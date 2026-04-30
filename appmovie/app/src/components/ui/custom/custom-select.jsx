import { useState } from "react";
import PropTypes from "prop-types";
import { Check, ChevronsUpDown, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function CustomSelect({
    field,
    data = [],
    label,
    getOptionLabel,
    getOptionValue,
    error,
}) {
    const [open, setOpen] = useState(false);

    const selectedLabel = data.find(
        (item) => String(getOptionValue(item)) === String(field.value)
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
                            !field.value && "text-white/40"
                        )}
                    >
                        <span className="truncate">
                            {selectedLabel
                                ? getOptionLabel(selectedLabel)
                                : `Seleccione ${label}`}
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
                                    const isSelected = String(field.value) === value;

                                    return (
                                        <CommandItem
                                            key={value}
                                            value={getOptionLabel(item)}
                                            onSelect={() => {
                                                field.onChange(value);
                                                setOpen(false);
                                            }}
                                            className={cn(
                                                "cursor-pointer rounded-xl mx-1 my-0.5 px-2 py-2 text-white/85 transition-colors",
                                                "hover:bg-violet-500/10 hover:text-white",
                                                isSelected && "bg-violet-500/20 text-violet-100"
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

            {error && (
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </p>
            )}
        </div>
    );
}

CustomSelect.propTypes = {
    field: PropTypes.shape({
        value: PropTypes.any,
        onChange: PropTypes.func.isRequired,
    }).isRequired,
    data: PropTypes.array,
    label: PropTypes.string.isRequired,
    getOptionLabel: PropTypes.func.isRequired,
    getOptionValue: PropTypes.func.isRequired,
    error: PropTypes.string,
};