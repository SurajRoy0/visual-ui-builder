"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy, Download, Upload, FileJson } from "lucide-react";

interface JsonModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SAMPLE_PROJECT_JSON = {
  name: "Playfull Project",
  version: "1.0.0",
  pages: {
    home: { id: "home", name: "Home", path: "/" },
  },
  elements: {
    "card-container": {
      type: "box",
      name: "Card Container",
      style: {
        width: "600px",
        padding: "48px 32px",
        borderRadius: "16px",
        background: "#ffffff",
      },
    },
  },
};

export const JsonModal: React.FC<JsonModalProps> = ({
  isOpen = false,
  onClose = () => { },
}) => {
  const [activeTab, setActiveTab] = useState<"export" | "import">("export");
  const jsonString = JSON.stringify(SAMPLE_PROJECT_JSON, null, 2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col rounded-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileJson className="size-4.5 text-blue-500" />
            <DialogTitle>Project JSON Schema</DialogTitle>
          </div>
          <DialogDescription>
            Export or import full declarative layout schemas for this project.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            if (val) setActiveTab(val as "export" | "import");
          }}
          className="flex-1 flex flex-col min-h-0"
        >
          {/* Modal Tabs */}
          <TabsList className="w-full justify-start h-8 bg-transparent border-b border-border p-0 rounded-none gap-2">
            <TabsTrigger
              value="export"
              className="pb-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer rounded-none border-b-2 border-transparent data-active:border-foreground data-active:shadow-none bg-transparent"
            >
              <Download className="size-3.5" />
              <span>Export JSON</span>
            </TabsTrigger>
            <TabsTrigger
              value="import"
              className="pb-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer rounded-none border-b-2 border-transparent data-active:border-foreground data-active:shadow-none bg-transparent"
            >
              <Upload className="size-3.5" />
              <span>Import JSON</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="flex-1 min-h-75 max-h-100 flex flex-col pt-3 overflow-hidden">
            <TabsContent value="export" className="flex-1 flex flex-col gap-2 overflow-hidden mt-0">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Project JSON Output (Static Schema)</span>
                <span className="font-mono text-[11px]">project.json</span>
              </div>
              <Textarea
                readOnly
                value={jsonString}
                className="flex-1 w-full bg-secondary/60 text-foreground font-mono text-[11px] p-3 rounded-md border border-border resize-none outline-none overflow-y-auto leading-relaxed select-text"
              />
            </TabsContent>
            <TabsContent value="import" className="flex-1 flex flex-col gap-2 overflow-hidden mt-0">
              <span className="text-xs text-muted-foreground">
                Paste JSON schema here:
              </span>
              <Textarea
                placeholder="Paste your project JSON schema here..."
                className="flex-1 w-full bg-secondary/60 text-foreground font-mono text-[11px] p-3 rounded-md border border-border resize-none outline-none overflow-y-auto leading-relaxed"
              />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-4 flex items-center justify-between sm:justify-between w-full">
          <div className="text-[11px] text-muted-foreground">Declarative layout model</div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="gap-1.5 rounded-md cursor-pointer">
              <Copy className="size-3.5" />
              Copy JSON
            </Button>
            <Button size="sm" onClick={onClose} className="gap-1.5 rounded-md cursor-pointer">
              <Download className="size-3.5" />
              Download JSON
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
