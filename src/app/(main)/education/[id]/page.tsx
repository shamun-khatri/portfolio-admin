"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
	educationSchema,
	type EducationFormValues,
} from "@/components/forms/form-schemas/education-schema";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/global/image-upload";
import { useSession } from "next-auth/react";

type Education = {
	_id: string;
	img: string;
	school: string;
	degree: string;
	date: string;
	grade: string;
	desc: string;
};

const fetchEducation = async (userId: string, id: string) => {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/education/${userId}/${id}`,
		{ credentials: "include" }
	);
	if (!res.ok) throw new Error("Failed to fetch education entry");
	return res.json() as Promise<Education>;
};

export default function EducationDetailPage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const userId = session?.user?.id as string | undefined;
	const id = params?.id as string;

	const { data: education, isLoading, isError } = useQuery({
		queryKey: ["education", userId, id],
		queryFn: () => fetchEducation(userId as string, id),
		enabled: !!userId && !!id,
	});

	const form = useForm<EducationFormValues>({
		resolver: zodResolver(educationSchema),
		defaultValues: {
			img: undefined,
			school: "",
			degree: "",
			date: "",
			grade: "",
			desc: "",
		},
		values: education
			? {
					img: undefined,
					school: education.school || "",
					degree: education.degree || "",
					date: education.date || "",
					grade: education.grade || "",
					desc: education.desc || "",
				}
			: undefined,
	});

	const mutation = useMutation<{ success?: boolean; message?: string }, Error, EducationFormValues>({
		mutationFn: async (values: EducationFormValues) => {
			const formData = new FormData();
			formData.append("school", values.school);
			formData.append("degree", values.degree);
			formData.append("date", values.date);
			formData.append("grade", values.grade);
			formData.append("desc", values.desc);
			if (values.img?.[0]) formData.append("img", values.img[0]);
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/education/${id}`, {
				method: "PUT",
				credentials: "include",
				body: formData,
			});
			if (!res.ok) throw new Error("Failed to update education entry");
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["education", userId] });
			queryClient.invalidateQueries({ queryKey: ["education", userId, id] });
			alert("Education entry updated successfully");
			router.push("/education");
		},
		onError: (err) => {
			console.error(err);
			alert(err.message || "Update failed");
		},
	});

	const onSubmit = (values: EducationFormValues) => {
		mutation.mutate(values);
	};

	if (!userId) return <p className="p-6">Sign in to continue.</p>;
	if (isLoading) return <p className="p-6">Loading...</p>;
	if (isError || !education) return <p className="p-6">Failed to load education entry.</p>;

	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle>Edit Education</CardTitle>
				<CardDescription>View and update this education entry</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Existing image preview */}
						{education.img && (
							<div className="relative">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={education.img}
									alt="Current"
									className="w-full h-48 object-cover rounded-lg"
								/>
							</div>
						)}

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<FormField
								control={form.control}
								name="school"
								render={({ field }) => (
									<FormItem>
										<FormLabel>School/Institution</FormLabel>
										<FormControl>
											<Input placeholder="e.g., Harvard University" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="degree"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Degree/Program</FormLabel>
										<FormControl>
											<Input placeholder="e.g., Bachelor of CS" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<FormField
								control={form.control}
								name="date"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Duration/Year</FormLabel>
										<FormControl>
											<Input placeholder="e.g., 2020-2024" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="grade"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Grade/GPA</FormLabel>
										<FormControl>
											<Input placeholder="e.g., 4.0 GPA" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="img"
							render={({ field: { onChange } }) => (
								<FormItem>
									<FormLabel>Update Logo/Image (optional)</FormLabel>
									<FormControl>
										<ImageUpload
											onFileChange={(file) => onChange(file ? [file] : undefined)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="desc"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Describe your achievements, coursework, activities, or any relevant details..."
											className="min-h-[120px]"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex gap-4 pt-2">
							<Button type="button" variant="outline" onClick={() => router.push("/education")}>
								Cancel
							</Button>
							<Button type="submit" disabled={mutation.isPending}>
								{mutation.isPending ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}

