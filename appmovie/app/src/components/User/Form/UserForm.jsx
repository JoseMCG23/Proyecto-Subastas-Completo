import PropTypes from "prop-types";
import { Controller } from "react-hook-form";
import { CalendarDays, Mail, Shield, User } from "lucide-react";
import { CustomInputField } from "@/components/ui/custom/custom-input-field";

UserForm.propTypes = {
    control: PropTypes.object.isRequired,
    errors: PropTypes.object,
};

function SectionLabel({ icon, title, subtitle }) {
    return (
        <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                {icon}
            </div>
            <div>
                <h3 className="text-base font-bold text-white">{title}</h3>
                <p className="text-sm text-white/55">{subtitle}</p>
            </div>
        </div>
    );
}

export function UserForm({ control, errors }) {
    return (
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
            <SectionLabel
                icon={<User className="h-5 w-5 text-white/70" />}
                title="Información del usuario"
                subtitle="Edita los datos principales del perfil seleccionado."
            />

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                    <Controller
                        name="nombreCompleto"
                        control={control}
                        render={({ field }) => (
                            <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                                    <User className="h-3.5 w-3.5" />
                                    Nombre completo
                                </div>
                                <CustomInputField
                                    {...field}
                                    label=""
                                    placeholder="Ingrese el nombre completo"
                                    error={errors?.nombreCompleto?.message}
                                />
                            </div>
                        )}
                    />
                </div>

                <div className="md:col-span-2">
                    <Controller
                        name="correo"
                        control={control}
                        render={({ field }) => (
                            <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                                    <Mail className="h-3.5 w-3.5" />
                                    Correo electrónico
                                </div>
                                <CustomInputField
                                    {...field}
                                    label=""
                                    placeholder="Ingrese el correo"
                                    error={errors?.correo?.message}
                                />
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="rol"
                        control={control}
                        render={({ field }) => (
                            <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                                    <Shield className="h-3.5 w-3.5" />
                                    Rol
                                </div>
                                <CustomInputField {...field} label="" disabled />
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="fechaRegistro"
                        control={control}
                        render={({ field }) => (
                            <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    Fecha de registro
                                </div>
                                <CustomInputField {...field} label="" disabled />
                            </div>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}