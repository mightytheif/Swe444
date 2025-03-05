
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Building, Plus, Filter, Search } from "lucide-react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { PropertyCard } from "@/components/ui/property-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Properties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState<string | null>(null);
  const [listingType, setListingType] = useState<string | null>(null);
  const { user } = useAuth();
  const isLandlord = user?.displayName?.split("|").includes("landlord");

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        let propertiesQuery = collection(db, "properties");
        
        // Apply filters if selected
        if (propertyType || listingType) {
          propertiesQuery = query(
            propertiesQuery,
            ...(propertyType ? [where("propertyType", "==", propertyType)] : []),
            ...(listingType === "sale" ? [where("forSale", "==", true)] : []),
            ...(listingType === "rent" ? [where("forRent", "==", true)] : []),
            orderBy("createdAt", "desc")
          );
        } else {
          propertiesQuery = query(
            propertiesQuery,
            orderBy("createdAt", "desc")
          );
        }

        const querySnapshot = await getDocs(propertiesQuery);
        const propertiesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Filter by search term if provided
        const filteredProperties = searchTerm 
          ? propertiesData.filter(property => 
              property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              property.location.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : propertiesData;
        
        setProperties(filteredProperties);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchTerm, propertyType, listingType]);

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building className="h-7 w-7" />
            Properties
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse all available properties
          </p>
        </div>
        
        {isLandlord && (
          <Link href="/properties/add">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Property
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={propertyType || ""} onValueChange={(value) => setPropertyType(value || null)}>
          <SelectTrigger>
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="villa">Villa</SelectItem>
            <SelectItem value="land">Land</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
          </SelectContent>
        </Select>

        <Select value={listingType || ""} onValueChange={(value) => setListingType(value || null)}>
          <SelectTrigger>
            <SelectValue placeholder="Listing Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Listings</SelectItem>
            <SelectItem value="sale">For Sale</SelectItem>
            <SelectItem value="rent">For Rent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h3 className="text-xl font-semibold mb-2">No properties found</h3>
          <p className="text-muted-foreground">
            Try changing your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
