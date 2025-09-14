import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  todoTitle: string;
}

export default function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading, 
  todoTitle 
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle text-destructive text-2xl mr-3"></i>
            <DialogTitle>Delete Task</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-muted-foreground mb-2">
            Are you sure you want to delete this task?
          </p>
          <p className="font-medium text-foreground mb-4">
            "{todoTitle}"
          </p>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            data-testid="button-cancel-delete"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            data-testid="button-confirm-delete"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
