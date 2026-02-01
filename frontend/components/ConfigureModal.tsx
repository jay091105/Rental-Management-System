'use client';

import { Fragment, useMemo, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import type { ProductVariant, VariantOption } from '@/context/OrderContext';

export interface ConfigureModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  basePrice: number;
  variants?: ProductVariant[];
  onConfirm: (selection: VariantOption[]) => void;
}

export default function ConfigureModal({
  open,
  onClose,
  title,
  basePrice,
  variants = [],
  onConfirm,
}: ConfigureModalProps) {
  const [selectedRadio, setSelectedRadio] = useState<Record<string, string>>({});
  const [selectedChecks, setSelectedChecks] = useState<Record<string, string[]>>({});

  const handleToggleCheckbox = (variantId: string, optionId: string) => {
    setSelectedChecks((prev) => {
      const current = new Set(prev[variantId] ?? []);
      current.has(optionId) ? current.delete(optionId) : current.add(optionId);
      return { ...prev, [variantId]: Array.from(current) };
    });
  };

  const handleConfirm = () => {
    const selected: VariantOption[] = [];

    for (const variant of variants) {
      if (variant.type === 'radio') {
        const optionId = selectedRadio[variant.id];
        const option = variant.options.find((o) => o.id === optionId);
        if (option) selected.push(option);
      } else {
        for (const optionId of selectedChecks[variant.id] ?? []) {
          const option = variant.options.find((o) => o.id === optionId);
          if (option) selected.push(option);
        }
      }
    }

    onConfirm(selected);
    onClose();
  };

  const totalPrice = useMemo(() => {
    let extra = 0;

    for (const variant of variants) {
      if (variant.type === 'radio') {
        const optionId = selectedRadio[variant.id];
        const option = variant.options.find((o) => o.id === optionId);
        if (option?.priceModifier) extra += option.priceModifier;
      } else {
        for (const optionId of selectedChecks[variant.id] ?? []) {
          const option = variant.options.find((o) => o.id === optionId);
          if (option?.priceModifier) extra += option.priceModifier;
        }
      }
    }

    return basePrice + extra;
  }, [variants, selectedRadio, selectedChecks, basePrice]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-bold">
              Configure {title}
            </Dialog.Title>

            <div className="mt-4 space-y-4">
              {variants.map((variant) => (
                <div key={variant.id}>
                  <div className="mb-2 font-semibold">{variant.name}</div>

                  <div className="flex flex-wrap gap-3">
                    {variant.options.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center gap-2 rounded-lg border p-2 text-sm"
                      >
                        {variant.type === 'radio' ? (
                          <input
                            type="radio"
                            name={variant.id}
                            checked={selectedRadio[variant.id] === option.id}
                            onChange={() =>
                              setSelectedRadio((prev) => ({
                                ...prev,
                                [variant.id]: option.id,
                              }))
                            }
                          />
                        ) : (
                          <input
                            type="checkbox"
                            checked={selectedChecks[variant.id]?.includes(option.id) ?? false}
                            onChange={() =>
                              handleToggleCheckbox(variant.id, option.id)
                            }
                          />
                        )}

                        <span>
                          {option.name}
                          {option.priceModifier
                            ? ` (+₹${option.priceModifier})`
                            : ''}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="font-semibold">Total: ₹{totalPrice}</span>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="rounded border px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="rounded bg-blue-600 px-4 py-2 text-white"
                >
                  Configure
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
