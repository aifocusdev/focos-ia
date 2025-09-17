import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';

interface ModalProps {
  id: string;
  isOpen: boolean;
  type: 'confirm' | 'info' | 'form';
  title: string;
  content: React.ReactNode | string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose: (id: string) => void;
}

const icons = {
  confirm: ExclamationTriangleIcon,
  info: InformationCircleIcon,
  form: null,
};

const iconColors = {
  confirm: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400',
  form: '',
};

const iconBackgrounds = {
  confirm: 'bg-yellow-100 dark:bg-yellow-800',
  info: 'bg-blue-100 dark:bg-blue-800',
  form: '',
};

export const Modal: React.FC<ModalProps> = ({
  id,
  isOpen,
  type,
  title,
  content,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  onClose,
}) => {
  const Icon = icons[type];

  const handleClose = () => {
    onClose(id);
  };

  const handleConfirm = () => {
    onConfirm?.();
    handleClose();
  };

  const handleCancel = () => {
    onCancel?.();
    handleClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  {Icon && (
                    <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${iconBackgrounds[type]}`}>
                      <Icon className={`h-6 w-6 ${iconColors[type]}`} aria-hidden="true" />
                    </div>
                  )}
                  <div className={`mt-3 text-center ${Icon ? 'sm:mt-5' : ''}`}>
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      {typeof content === 'string' ? (
                        <p className="text-sm text-gray-500 dark:text-gray-300">{content}</p>
                      ) : (
                        content
                      )}
                    </div>
                  </div>
                </div>

                {type !== 'info' && (
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <Button
                      variant="primary"
                      onClick={handleConfirm}
                      className="sm:col-start-2"
                    >
                      {confirmText}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleCancel}
                      className="mt-3 sm:col-start-1 sm:mt-0"
                    >
                      {cancelText}
                    </Button>
                  </div>
                )}

                {type === 'info' && (
                  <div className="mt-5 sm:mt-6">
                    <Button
                      variant="primary"
                      onClick={handleClose}
                      className="w-full"
                    >
                      OK
                    </Button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};