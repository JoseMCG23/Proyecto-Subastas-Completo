import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export const CustomInputField = ({ label, error, className, ...props }) => (
  <div className="w-full space-y-2">
    {label && (
      <Label className="block text-sm font-medium text-white/85">{label}</Label>
    )}

    <Input
      {...props}
      className={cn(
        "h-11 w-full rounded-2xl border border-white/10 bg-black/20 text-white shadow-none",
        "placeholder:text-white/35 hover:bg-white/[0.04] focus:border-violet-400/40 focus:ring-2 focus:ring-violet-400/20",
        "disabled:cursor-not-allowed disabled:opacity-100 disabled:text-white/65",
        error && "border-red-400/50 focus:border-red-400/50 focus:ring-red-400/20",
        className
      )}
    />

    {error && (
      <p className="flex items-center gap-1.5 text-sm text-red-400">
        <AlertCircle className="h-4 w-4" />
        {error}
      </p>
    )}
  </div>
);

CustomInputField.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
};