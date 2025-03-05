import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bed, Bath, Grid, MapPin, Tag, Ruler, Calendar, User, Phone, Mail, Edit, Trash2, Flag, CheckCircle, Home, DollarSign, Loader2, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PropertyData {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  propertyType: string;
  forSale: boolean;
  forRent: boolean;
  featured: boolean;
  userId: string;
  userEmail: string;
  createdAt: any;
  updatedAt: any;
  images: string[];
  status: string;
  sellerName?: string;
  sellerPhone?: string;
  sellerContact?: string;
}

export default function PropertyPage() {
  const [, params] = useRoute<{ id: string }>("/property/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!params?.id) return;

      try {
        const propertyRef = doc(db, "properties", params.id);
        const propertySnap = await getDoc(propertyRef);

        if (propertySnap.exists()) {
          const data = propertySnap.data() as PropertyData;
          setProperty(data);
          if (data.images && data.images.length > 0) {
            setActiveImage(data.images[0]);
          }
        } else {
          toast({
            title: "Property not found",
            description: "The property you're looking for doesn't exist",
            variant: "destructive",
          });
          setLocation("/properties");
        }
      } catch (error: any) {
        console.error("Error fetching property:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load property",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [params?.id, setLocation, toast]);

  const handleMarkAsSold = async () => {
    await handleStatusChange("sold");
  };

  const handleMarkAsRented = async () => {
    await handleStatusChange("rented");
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!canEdit) return;

    setIsSubmitting(true);
    try {
      const propertyRef = doc(db, "properties", property.id);
      await updateDoc(propertyRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      setProperty({
        ...property,
        status: newStatus,
      });

      toast({
        title: "Status Updated",
        description: `Property is now marked as ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating property status:", error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating the property status",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProperty = async () => {
    if (!property) return;

    setIsSubmitting(true);
    try {
      const propertyRef = doc(db, "properties", property.id);
      await deleteDoc(propertyRef);

      toast({
        title: "Property Deleted",
        description: "The property has been permanently deleted",
      });

      setLocation("/properties");
    } catch (error: any) {
      console.error("Error deleting property:", error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete property",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-10 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
        <p className="mb-4">The property you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => setLocation("/properties")}>
          View All Properties
        </Button>
      </div>
    );
  }

  // Format the price with commas for thousands
  const formattedPrice = new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(property.price);

  // Format dates
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } catch (e) {
      return "Invalid date";
    }
  };

  const isOwner = user && user.uid === property.userId;
  const isAdmin = user && user.email?.toLowerCase().endsWith('@sakany.com');
  const canEdit = isOwner || isAdmin;

  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Property Images */}
        <div className="md:col-span-2 space-y-4">
          {/* Main Image */}
          <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
            {property.status !== "active" && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                <span className="px-4 py-2 rounded-full text-lg font-bold text-white uppercase">
                  {property.status}
                </span>
              </div>
            )}

            <img
              src={activeImage || "https://placehold.co/800x600?text=No+Image"}
              alt={property.title}
              className="w-full h-full object-cover"
            />

            {property.featured && (
              <Badge className="absolute top-4 left-4 z-10 bg-yellow-500">
                Featured
              </Badge>
            )}
          </div>

          {/* Image Thumbnails */}
          {property.images && property.images.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {property.images.map((image, index) => (
                <div
                  key={index}
                  className={`cursor-pointer aspect-square rounded-md overflow-hidden border-2 ${
                    activeImage === image ? "border-primary" : "border-border"
                  }`}
                  onClick={() => setActiveImage(image)}
                >
                  <img
                    src={image}
                    alt={`Property ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Property Details Tabs */}
          <Tabs defaultValue="details">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="py-4">
              <h2 className="text-xl font-semibold mb-4">About This Property</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {property.description}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Listed on</p>
                    <p className="font-medium">{formatDate(property.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Property Type</p>
                    <p className="font-medium capitalize">{property.propertyType}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="py-4">
              <h2 className="text-xl font-semibold mb-4">Property Features</h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center p-3 border rounded-md">
                  <Bed className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                    <p className="font-medium">{property.bedrooms}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 border rounded-md">
                  <Bath className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                    <p className="font-medium">{property.bathrooms}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 border rounded-md">
                  <Ruler className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Area</p>
                    <p className="font-medium">{property.area} sqm</p>
                  </div>
                </div>

                <div className="flex items-center p-3 border rounded-md">
                  <Home className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Property Type</p>
                    <p className="font-medium capitalize">{property.propertyType}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 border rounded-md">
                  <DollarSign className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">For Sale</p>
                    <p className="font-medium">{property.forSale ? "Yes" : "No"}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 border rounded-md">
                  <DollarSign className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">For Rent</p>
                    <p className="font-medium">{property.forRent ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="py-4">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Owner/Agent Email:</h3>
                  <p className="text-muted-foreground">{property.userEmail}</p>
                </div>

                {property.sellerName && (
                  <div>
                    <h3 className="font-medium">Contact Person:</h3>
                    <p className="text-muted-foreground">{property.sellerName}</p>
                  </div>
                )}

                {property.sellerPhone && (
                  <div>
                    <h3 className="font-medium">Phone Number:</h3>
                    <p className="text-muted-foreground">{property.sellerPhone}</p>
                  </div>
                )}

                {property.sellerContact && property.sellerContact !== property.userEmail && (
                  <div>
                    <h3 className="font-medium">Alternative Email:</h3>
                    <p className="text-muted-foreground">{property.sellerContact}</p>
                  </div>
                )}

                {property.forSale && (
                  <div className="p-4 bg-blue-50 rounded-lg mt-6">
                    <h3 className="font-medium text-blue-800 mb-2">
                      This property is for sale
                    </h3>
                    <p className="text-blue-700 text-sm">
                      Contact the seller for more information about purchasing this property.
                    </p>
                  </div>
                )}

                {property.forRent && (
                  <div className="p-4 bg-green-50 rounded-lg mt-2">
                    <h3 className="font-medium text-green-800 mb-2">
                      This property is available for rent
                    </h3>
                    <p className="text-green-700 text-sm">
                      Contact the owner for rental terms and viewing appointments.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Property Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{property.title}</CardTitle>
              <CardDescription>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{property.location}</span>
                </div>
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-bold text-primary mb-4">
                {formattedPrice}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Bed className="h-3 w-3" />
                  {property.bedrooms} Beds
                </Badge>

                <Badge variant="outline" className="flex items-center gap-1">
                  <Bath className="h-3 w-3" />
                  {property.bathrooms} Baths
                </Badge>

                <Badge variant="outline" className="flex items-center gap-1">
                  <Ruler className="h-3 w-3" />
                  {property.area} sqm
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>ID: {property.id.substring(0, 8)}</span>
                <span>Updated: {formatDate(property.updatedAt)}</span>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full">Contact Seller</Button>

              {canEdit && (
                <div className="w-full grid grid-cols-2 gap-2 mt-2">
                  <Button variant="outline" onClick={() => setLocation(`/edit-property/${property.id}`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the property
                          and remove the data from the servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteProperty}
                          disabled={isSubmitting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Delete"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}

              {canEdit && (
                <div className="w-full grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{property.status}</p>
                    </div>
                  </div>
                  <div className="col-span-2 mt-4 p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-2">Manage Property Status</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={property.status === "active" ? "default" : "outline"}
                        onClick={() => handleStatusChange("active")}
                        disabled={isSubmitting || property.status === "active"}
                      >
                        Active
                      </Button>
                      <Button
                        size="sm"
                        variant={property.status === "sold" ? "default" : "outline"}
                        onClick={() => handleStatusChange("sold")}
                        disabled={isSubmitting || property.status === "sold" || !property.forSale}
                      >
                        Sold
                      </Button>
                      <Button
                        size="sm"
                        variant={property.status === "rented" ? "default" : "outline"}
                        onClick={() => handleStatusChange("rented")}
                        disabled={isSubmitting || property.status === "rented" || !property.forRent}
                      >
                        Rented
                      </Button>
                      <Button
                        size="sm"
                        variant={property.status === "inactive" ? "default" : "outline"}
                        onClick={() => handleStatusChange("inactive")}
                        disabled={isSubmitting || property.status === "inactive"}
                      >
                        Inactive
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardFooter>
          </Card>

          {/* Flag Property */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Report Property</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Flag className="h-4 w-4 mr-2" />
                Report this property
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}