import PropTypes from "prop-types";
import { Controller, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Package,
    Plus,
    Trash2,
    ImagePlus,
    FileText,
    Tag,
    UserRound,
    ShieldCheck,
    Check,
    AlertCircle,
} from "lucide-react";

FunkoForm.propTypes = {
    control: PropTypes.object.isRequired,
    errors: PropTypes.object,
    dataCategorias: PropTypes.array.isRequired,
    usuarioActual: PropTypes.object.isRequired,
    fileURLs: PropTypes.array,
    onChangeImage: PropTypes.func.isRequired,
};

function SectionTitle({ icon: Icon, title, subtitle }) {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 ring-1 ring-violet-400/20 shadow-[0_0_20px_rgba(139,92,246,0.10)]">
                    <Icon className="h-5 w-5 text-violet-300" />
                </div>

                <div>
                    <h3 className="text-base font-semibold tracking-wide text-white">
                        {title}
                    </h3>
                    {subtitle ? (
                        <p className="text-sm text-slate-400">{subtitle}</p>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function FieldLabel({ icon: Icon, children }) {
    return (
        <label className="mb-2 flex items-center gap-2 text-sm font-medium tracking-wide text-white">
            {Icon ? <Icon className="h-4 w-4 text-violet-300" /> : null}
            <span>{children}</span>
        </label>
    );
}

function SelectField({ value, onChange, options, placeholder, error }) {
    return (
        <select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={`h-11 w-full rounded-2xl border px-3 text-sm outline-none transition ${error
                    ? "border-red-400/50 bg-slate-950 text-white focus:border-red-400/60 focus:ring-2 focus:ring-red-400/20"
                    : "border-slate-700/80 bg-slate-950 text-white hover:border-violet-400/30 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20"
                }`}
        >
            <option value="" disabled className="bg-slate-950 text-slate-400">
                {placeholder}
            </option>

            {options.map((opt) => (
                <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-slate-950 text-white"
                >
                    {opt.label}
                </option>
            ))}
        </select>
    );
}

function CategoriesField({ value = [], onChange, categorias = [] }) {
    const selected = Array.isArray(value) ? value.map(String) : [];

    const toggleCategoria = (id) => {
        const idStr = String(id);
        const exists = selected.includes(idStr);

        if (exists) onChange(selected.filter((x) => x !== idStr));
        else onChange([...selected, idStr]);
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {categorias.map((cat) => {
                    const id = String(cat.idCategoria);
                    const active = selected.includes(id);

                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => toggleCategoria(id)}
                            className={`group flex items-center justify-between rounded-2xl border px-3 py-2.5 text-sm transition-all duration-200 ${active
                                    ? "border-violet-400/30 bg-violet-500/12 text-white shadow-[0_0_0_1px_rgba(139,92,246,0.06)]"
                                    : "border-slate-700/70 bg-slate-950 text-slate-300 hover:border-violet-400/25 hover:bg-slate-900 hover:text-white"
                                }`}
                        >
                            <span className="truncate">{cat.nombre}</span>

                            <span
                                className={`ml-2 flex h-5 w-5 items-center justify-center rounded-full border transition ${active
                                        ? "border-violet-300/40 bg-violet-400/20 text-violet-100"
                                        : "border-slate-600 text-transparent group-hover:border-violet-400/30"
                                    }`}
                            >
                                <Check className="h-3.5 w-3.5" />
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function ErrorText({ children }) {
    return (
        <div className="mt-2 flex items-start gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{children}</span>
        </div>
    );
}

export function FunkoForm({
    control,
    errors,
    dataCategorias,
    usuarioActual,
    fileURLs = [],
    onChangeImage,
}) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "imagenes",
    });

    const addNewImage = () => append({ urlImagen: "" });

    const removeImage = (index) => {
        if (fields.length > 1) remove(index);
    };

    return (
        <div className="space-y-8">
            <section className="rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
                <SectionTitle
                    icon={Package}
                    title="Información del funko"
                    subtitle="Completa los datos principales del objeto."
                />

                <div className="space-y-6">
                    <div>
                        <FieldLabel>Nombre</FieldLabel>
                        <Controller
                            name="nombre"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    placeholder="Ingrese el nombre del funko"
                                    className={`h-11 rounded-2xl bg-slate-950 text-white placeholder:text-slate-500 hover:border-violet-400/30 focus-visible:border-violet-400/50 focus-visible:ring-2 focus-visible:ring-violet-500/20 ${errors?.nombre
                                            ? "border-red-400/50"
                                            : "border-slate-700/80"
                                        }`}
                                />
                            )}
                        />
                        {errors?.nombre && (
                            <ErrorText>{errors.nombre.message}</ErrorText>
                        )}
                    </div>

                    <div>
                        <FieldLabel icon={FileText}>Descripción</FieldLabel>
                        <Controller
                            name="descripcion"
                            control={control}
                            render={({ field }) => (
                                <textarea
                                    {...field}
                                    placeholder="Ingrese la descripción del funko"
                                    className={`min-h-[130px] w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition hover:border-violet-400/30 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20 ${errors?.descripcion
                                            ? "border border-red-400/50"
                                            : "border border-slate-700/80"
                                        }`}
                                />
                            )}
                        />
                        {errors?.descripcion && (
                            <ErrorText>{errors.descripcion.message}</ErrorText>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <FieldLabel>Condición</FieldLabel>
                            <Controller
                                name="condicion"
                                control={control}
                                render={({ field }) => (
                                    <SelectField
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Seleccione condición"
                                        options={[
                                            { value: "Nuevo", label: "Nuevo" },
                                            { value: "Usado", label: "Usado" },
                                        ]}
                                        error={errors?.condicion?.message}
                                    />
                                )}
                            />
                            {errors?.condicion && (
                                <ErrorText>{errors.condicion.message}</ErrorText>
                            )}
                        </div>

                        <div>
                            <FieldLabel icon={ShieldCheck}>Estado inicial</FieldLabel>
                            <Input
                                value="DISPONIBLE"
                                disabled
                                className="h-11 rounded-2xl border-slate-700/80 bg-slate-900 text-slate-300 disabled:opacity-100"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <FieldLabel icon={UserRound}>Usuario vendedor</FieldLabel>
                            <Input
                                value={usuarioActual?.nombre || ""}
                                disabled
                                className="h-11 rounded-2xl border-slate-700/80 bg-slate-900 text-slate-300 disabled:opacity-100"
                            />
                        </div>

                        <div>
                            <FieldLabel icon={Tag}>Categorías</FieldLabel>
                            <Controller
                                name="categorias"
                                control={control}
                                render={({ field }) => (
                                    <CategoriesField
                                        value={field.value}
                                        onChange={field.onChange}
                                        categorias={dataCategorias}
                                    />
                                )}
                            />
                            {errors?.categorias && (
                                <ErrorText>{errors.categorias.message}</ErrorText>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <SectionTitle
                        icon={ImagePlus}
                        title="Galería de imágenes"
                        subtitle="Agrega una o varias imágenes del funko."
                    />

                    <Button
                        type="button"
                        variant="outline"
                        onClick={addNewImage}
                        className="rounded-2xl border-slate-700 bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar imagen
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    {fields.map((field, index) => {
                        const imageError = errors?.imagenes?.[index]?.urlImagen;

                        return (
                            <div
                                key={field.id}
                                className={`rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.18)] ${imageError
                                        ? "border border-red-400/30 bg-red-500/5"
                                        : "border border-slate-800 bg-slate-900/80"
                                    }`}
                            >
                                <div className="mb-4 flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            Imagen {index + 1}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            Haz clic en el recuadro para cargar la imagen
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => removeImage(index)}
                                        disabled={fields.length === 1}
                                        className="rounded-xl text-slate-300 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-30"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Eliminar
                                    </Button>
                                </div>

                                <div
                                    className={`group relative flex h-64 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed transition ${imageError
                                            ? "border-red-400/40 bg-red-500/5 hover:border-red-400/60"
                                            : "border-violet-400/25 bg-[#020617] hover:border-violet-400/45"
                                        }`}
                                    onClick={() =>
                                        document.getElementById(`image-${index}`)?.click()
                                    }
                                >
                                    {!fileURLs[index] ? (
                                        <div className="px-6 text-center">
                                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-400/20">
                                                <ImagePlus className="h-6 w-6 text-violet-300" />
                                            </div>

                                            <p className="text-sm font-medium text-white">
                                                Seleccionar imagen
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                JPG, PNG u otro formato compatible
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <img
                                                src={fileURLs[index]}
                                                alt={`preview-${index}`}
                                                className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-[1.02]"
                                            />
                                            <div className="pointer-events-none absolute inset-0 bg-black/10 opacity-0 transition group-hover:opacity-100" />
                                        </>
                                    )}
                                </div>

                                <input
                                    type="file"
                                    id={`image-${index}`}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => onChangeImage(e, index)}
                                />

                                <div className="mt-4">
                                    <FieldLabel icon={Tag}>Archivo seleccionado</FieldLabel>
                                    <Controller
                                        name={`imagenes.${index}.urlImagen`}
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                readOnly
                                                placeholder="Nombre de la imagen"
                                                className={`h-11 rounded-2xl bg-slate-950 text-white placeholder:text-slate-500 ${imageError
                                                        ? "border-red-400/50"
                                                        : "border-slate-700/80"
                                                    }`}
                                            />
                                        )}
                                    />
                                    {imageError && (
                                        <ErrorText>{imageError.message}</ErrorText>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

export default FunkoForm;