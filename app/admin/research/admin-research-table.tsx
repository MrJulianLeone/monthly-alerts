"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Trash2, ExternalLink, FileText } from "lucide-react"
import { deleteResearchArticle } from "@/app/actions/research"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Article {
  id: string
  slug: string
  title: string
  topic: string
  meta_description: string
  published_at: string
  created_at: string
}

interface AdminResearchTableProps {
  articles: Article[]
}

export default function AdminResearchTable({ articles }: AdminResearchTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDelete = async (articleId: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"? This action cannot be undone.`)) {
      return
    }

    setDeletingId(articleId)
    try {
      const result = await deleteResearchArticle(articleId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || 'Failed to delete article')
      }
    } catch (error) {
      alert('Failed to delete article')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">Published Articles</h2>
          <p className="text-sm text-muted-foreground">
            All research articles available on the public Research page
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {articles.length} Total Articles
        </Badge>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No research articles have been published yet</p>
          <p className="text-xs mt-2">Click &quot;Generate New Article&quot; to create your first research article</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                <th className="pb-3 pr-4">Published</th>
                <th className="pb-3 pr-4">Title</th>
                <th className="pb-3 pr-4">Topic</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-border/50">
                  <td className="py-4 pr-4 text-sm whitespace-nowrap">
                    {formatDate(article.published_at)}
                  </td>
                  <td className="py-4 pr-4">
                    <div className="max-w-md">
                      <p className="font-medium text-sm line-clamp-1">{article.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {article.meta_description}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <Badge variant="secondary" className="text-xs">
                      {article.topic.length > 30 ? article.topic.substring(0, 30) + '...' : article.topic}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/research/${article.slug}`} target="_blank">
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(article.id, article.title)}
                        disabled={deletingId === article.id}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        {deletingId === article.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
