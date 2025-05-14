import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { knowledgeBaseService, QAPair } from "@/utils/knowledge-base-service"
import {
    MessageSquarePlus,
    Search,
    Edit2,
    Trash2,
    Plus,
    Loader2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

// Form schema for QA pairs
const qaPairSchema = z.object({
    question: z.string().min(3, { message: "Question must be at least 3 characters" }),
    answer: z.string().min(3, { message: "Answer must be at least 3 characters" }),
    category: z.string().min(1, { message: "Category is required" }),
})

type QAPairFormValues = z.infer<typeof qaPairSchema>

interface QAPairListProps {
    qaPairs: QAPair[]
    onQAPairsChange: (qaPairs: QAPair[]) => void
}

export function QAPairList({ qaPairs, onQAPairsChange }: QAPairListProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [editingPair, setEditingPair] = useState<QAPair | null>(null)
    const { toast } = useToast()

    const form = useForm<QAPairFormValues>({
        resolver: zodResolver(qaPairSchema),
        defaultValues: {
            question: "",
            answer: "",
            category: "",
        },
    })

    const editForm = useForm<QAPairFormValues>({
        resolver: zodResolver(qaPairSchema),
        defaultValues: {
            question: "",
            answer: "",
            category: "",
        },
    })

    // Filter QA pairs based on search term
    const filteredQAPairs = qaPairs.filter(
        (pair) =>
            pair.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pair.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pair.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Add a new QA pair
    const onSubmit = async (values: QAPairFormValues) => {
        setIsLoading(true)
        try {
            const response = await knowledgeBaseService.createQAPair({
                question: values.question,
                answer: values.answer,
                category: values.category
            })
            onQAPairsChange([response.data.data, ...qaPairs])

            toast({
                title: "QA pair created",
                description: "The QA pair has been added to the knowledge base.",
            })

            form.reset()
            setIsDialogOpen(false)
        } catch (error) {
            console.error("Failed to create QA pair:", error)

            toast({
                title: "Error",
                description: "Failed to create QA pair. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Edit a QA pair
    const onEditSubmit = async (values: QAPairFormValues) => {
        if (!editingPair) return

        setIsLoading(true)
        try {
            const response = await knowledgeBaseService.updateQAPair(editingPair.id, {
                question: values.question,
                answer: values.answer,
                category: values.category
            })

            // Update the list with the edited pair
            const updatedPairs = qaPairs.map((pair) =>
                pair.id === editingPair.id ? response.data.data : pair
            )

            onQAPairsChange(updatedPairs)

            toast({
                title: "QA pair updated",
                description: "The QA pair has been updated in the knowledge base.",
            })

            editForm.reset()
            setIsEditDialogOpen(false)
            setEditingPair(null)
        } catch (error) {
            console.error("Failed to update QA pair:", error)

            toast({
                title: "Error",
                description: "Failed to update QA pair. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Delete a QA pair
    const handleDelete = async (pairId: string) => {
        if (!confirm("Are you sure you want to delete this QA pair?")) return

        try {
            await knowledgeBaseService.deleteQAPair(pairId)

            onQAPairsChange(qaPairs.filter((pair) => pair.id !== pairId))

            toast({
                title: "QA pair deleted",
                description: "The QA pair has been removed from the knowledge base.",
            })
        } catch (error) {
            console.error("Failed to delete QA pair:", error)

            toast({
                title: "Error",
                description: "Failed to delete QA pair. Please try again.",
                variant: "destructive",
            })
        }
    }

    // Start editing a QA pair
    const handleEdit = (pair: QAPair) => {
        setEditingPair(pair)
        editForm.reset({
            question: pair.question,
            answer: pair.answer,
            category: pair.category,
        })
        setIsEditDialogOpen(true)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Q&A Pairs</h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Q&A Pair
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Q&A Pair</DialogTitle>
                            <DialogDescription>
                                Add a question and answer pair to the knowledge base
                            </DialogDescription>
                        </DialogHeader>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="question"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Question</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter a question"
                                                    {...field}
                                                    rows={2}
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="answer"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Answer</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter the answer"
                                                    {...field}
                                                    rows={4}
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., FAQ, Product, Support"
                                                    {...field}
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Add Pair
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search Q&A pairs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9"
                />
            </div>

            {filteredQAPairs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No matching Q&A pairs found" : "No Q&A pairs added yet"}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredQAPairs.map((pair) => (
                        <Card key={pair.id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="pr-8">
                                        <CardTitle className="text-base font-medium">
                                            {pair.question}
                                        </CardTitle>
                                    </div>
                                    <div className="flex space-x-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(pair)}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                            <span className="sr-only">Edit</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(pair.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-line">
                                    {pair.answer}
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Badge variant="outline">{pair.category}</Badge>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Q&A Pair</DialogTitle>
                        <DialogDescription>
                            Update this question and answer pair
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                            <FormField
                                control={editForm.control}
                                name="question"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Question</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter a question"
                                                {...field}
                                                rows={2}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={editForm.control}
                                name="answer"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Answer</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter the answer"
                                                {...field}
                                                rows={4}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={editForm.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., FAQ, Product, Support"
                                                {...field}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditDialogOpen(false)
                                        setEditingPair(null)
                                    }}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Pair
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
} 