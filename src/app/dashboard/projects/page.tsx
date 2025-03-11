"use client";

import { ProjectCard } from "@/components/project-card";
import { DocumentItem } from "@/components/document-item";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import ProjectCreationModal from "@/components/project/project-modal";
import { fetchData } from "@/utils/fetchData";
import { formatTableData } from "@/utils/formatTableData";
import { FormattedTableData } from "@/types";
import { useSession } from "next-auth/react";

function groupDocumentsByProject(documents: FormattedTableData[]) {
  const projectMap = new Map<string, FormattedTableData[]>();

  documents.forEach((doc) => {
    if (doc.projectno) {
      if (!projectMap.has(doc.projectno)) {
        projectMap.set(doc.projectno, []);
      }
      projectMap.get(doc.projectno)?.push(doc);
    }
  });

  return Array.from(projectMap.entries()).map(([projectno, docs]) => ({
    projectno,
    documents: docs,
    projectData: docs[0],
  }));
}

export default function Projects() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<FormattedTableData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchData();
        const formattedData = formatTableData(data);
        setDocuments(formattedData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const projectGroups = groupDocumentsByProject(documents);

  if (loading) {
    return <div className="p-6">Loading projects...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button disabled={!session} onClick={() => setIsModalOpen(true)}>
          Create Project
        </Button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Projects</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectGroups.map((group) => {
          const totalVariants = group.documents.reduce((total, doc) => {
            return total + (doc.languagevariants?.length || 0);
          }, 0);

          return (
            <ProjectCard
              key={group.projectno}
              project={group.projectData}
              documentCount={totalVariants}
            >
              {group.documents.map((doc) =>
                doc.languagevariants?.map((variant, variantIndex) => (
                  <DocumentItem
                    key={`${doc.documentno}-${variantIndex}`}
                    documentNo={doc.documentno}
                    title={doc.manualtitle}
                    languageVariant={variant}
                  />
                ))
              )}
            </ProjectCard>
          );
        })}
      </div>

      {isModalOpen && (
        <ProjectCreationModal
          onClose={() => setIsModalOpen(false)}
          onProjectCreated={() => {
            fetchData().then((data) => {
              const formattedData = formatTableData(data);
              setDocuments(formattedData);
            });
          }}
        />
      )}
    </div>
  );
}
